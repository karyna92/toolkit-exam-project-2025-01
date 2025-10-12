const userQueries = require('../queries/userQueries');
const chatQueries = require('../queries/chatQueries');
const catalogQueries = require('../queries/catalogQueries');
const controller = require('../sockets/socketInit');
const { ServerError, NotFoundError, BadRequestError } = require('../errors');

module.exports.addMessage = async (req, res, next) => {
  try {
    const { recipient, messageBody, interlocutor } = req.body;
    const senderId = req.tokenData.userId;

    if (!recipient || !messageBody) {
      throw new BadRequestError('Recipient and message body are required.');
    }

    const participants = [senderId, recipient];

    const conversation =
      await chatQueries.findOrCreateConversation(participants);

    const message = await chatQueries.createMessage(
      senderId,
      conversation.id,
      messageBody
    );

    const interlocutorId = participants.find((id) => id !== senderId);

    const preview = {
      id: conversation.id,
      senderId,
      text: messageBody,
      createAt: message.createdAt,
      participants,
      blackList: [false, false],
      favoriteList: [false, false],
    };

    controller.getChatController().emitNewMessage(interlocutorId, {
      message: message.toJSON(),
      preview: {
        ...preview,
        interlocutor: {
          id: senderId,
          firstName: req.tokenData.firstName,
          lastName: req.tokenData.lastName,
          displayName: req.tokenData.displayName,
          avatar: req.tokenData.avatar,
          email: req.tokenData.email,
        },
      },
    });

    res.send({
      message: message.toJSON(),
      preview: { ...preview, interlocutor },
    });
  } catch (err) {
    next(
      err instanceof Error ? err : new ServerError('Failed to send message.')
    );
  }
};

module.exports.getChat = async (req, res, next) => {
  const interlocutorId = Number(req.query.interlocutorId);
  const userId = req.tokenData.userId;
  const participants = [userId, interlocutorId].sort((a, b) => a - b);

  try {
    if (!interlocutorId)
      throw new BadRequestError('Interlocutor ID is required.');

    const conversation =
      await chatQueries.findOrCreateConversation(participants);

    const messages = await chatQueries.getConversationMessages(conversation.id);

    const participantData = await chatQueries.getConversationParticipants(
      conversation.id
    );

    const interlocutor = await userQueries.findUser({ id: interlocutorId });
    if (!interlocutor) throw new NotFoundError('Interlocutor not found.');

    const transformedResponse = {
      id: conversation.id,
      participants: conversation.participants.map((p) => p.id),
      blackList: participantData.map((p) => p.blackList),
      favoriteList: participantData.map((p) => p.favoriteList),
      messages: messages.map((m) => m.toJSON()),
      interlocutor: {
        id: interlocutor.id,
        firstName: interlocutor.firstName,
        lastName: interlocutor.lastName,
        displayName: interlocutor.displayName,
        avatar: interlocutor.avatar,
      },
    };

    res.send(transformedResponse);
  } catch (err) {
    next(err instanceof Error ? err : new ServerError('Failed to load chat.'));
  }
};

module.exports.getPreview = async (req, res, next) => {
  try {
    const userId = req.tokenData.userId;
    const conversations = await chatQueries.getPreviewData(userId);

    const formatted = conversations.map((c) => {
      const lastMessage = c.messages[0];
      const other = c.participants.find((p) => p.id !== userId);

      return {
        id: c.id,
        senderId: lastMessage?.senderId,
        text: lastMessage?.body,
        createdAt: lastMessage?.createdAt,
        participants: c.participants.map((p) => p.id),
        blackList: c.participants.map(
          (p) => p.ConversationToParticipants.blackList
        ),
        favoriteList: c.participants.map(
          (p) => p.ConversationToParticipants.favoriteList
        ),
        interlocutor: other
          ? {
              id: other.id,
              firstName: other.firstName,
              lastName: other.lastName,
              displayName: other.displayName,
              avatar: other.avatar,
            }
          : null,
      };
    });
    res.send(formatted);
  } catch (err) {
    next(
      err instanceof Error ? err : new ServerError('Failed to get previews.')
    );
  }
};

module.exports.blackList = async (req, res, next) => {
  try {
    const { conversationId, blackListFlag, participants } = req.body;

    if (!conversationId || typeof blackListFlag !== 'boolean') {
      throw new BadRequestError('Invalid request data for blacklist update.');
    }

    const updated = await chatQueries.updateBlackListFlag(
      conversationId,
      req.tokenData.userId,
      blackListFlag
    );

    if (!updated) throw new NotFoundError('Conversation not found.');

    const conversation =
      await chatQueries.getConversationWithParticipants(conversationId);

    const transformedResponse = {
      id: conversation.id,
      participants: conversation.participants.map((p) => p.id),
      blackList: conversation.participants.map(
        (p) => p.ConversationToParticipants.blackList
      ),
      favoriteList: conversation.participants.map(
        (p) => p.ConversationToParticipants.favoriteList
      ),
    };
    res.send(transformedResponse);

    const interlocutorId = participants.find((p) => p !== req.tokenData.userId);
    controller
      .getChatController()
      .emitChangeBlockStatus(interlocutorId, conversation.toJSON());
  } catch (err) {
    next(
      err instanceof Error
        ? err
        : new ServerError('Failed to update blacklist.')
    );
  }
};

module.exports.favoriteChat = async (req, res, next) => {
  try {
    const { conversationId, favoriteFlag } = req.body;
    const userId = req.tokenData.userId;

    if (!conversationId || typeof favoriteFlag !== 'boolean') {
      throw new BadRequestError('Invalid request data for favorite update.');
    }

    const updated = await chatQueries.updateFavoriteFlag(
      conversationId,
      userId,
      favoriteFlag
    );

    if (!updated) throw new NotFoundError('Conversation not found.');

    const conversation =
      await chatQueries.getConversationWithParticipants(conversationId);

    if (!conversation) throw new NotFoundError('Conversation not found.');

    const transformedResponse = {
      id: conversation.id,
      participants: conversation.participants.map((p) => p.id),
      blackList: conversation.participants.map(
        (p) => p.ConversationToParticipants.blackList
      ),
      favoriteList: conversation.participants.map(
        (p) => p.ConversationToParticipants.favoriteList
      ),
    };

    res.send(transformedResponse);
  } catch (err) {
    next(
      err instanceof Error
        ? err
        : new ServerError('Failed to update favorite status.')
    );
  }
};

module.exports.createCatalog = async (req, res, next) => {
  try {
    const { catalogName, chatId } = req.body;
    const userId = req.tokenData.userId;

    if (!catalogName) throw new BadRequestError('Catalog name is required.');
  
    const catalog = await catalogQueries.createCatalogRecord(
      userId,
      catalogName
    );

    await catalogQueries.addChatToCatalog(catalog.id, chatId);

    const catalogWithChats = await catalogQueries.getCatalogWithChats(
      catalog.id
    );

    if (!catalogWithChats)
      throw new ServerError('Failed to fetch created catalog.');

    const responseData = {
      id: catalogWithChats.id,
      catalogName: catalogWithChats.catalogName,
      chats: catalogWithChats.Conversations
        ? catalogWithChats.Conversations.map((conv) => conv.id)
        : [],
    };

    res.send(responseData);
  } catch (err) {
    next(
      err instanceof Error ? err : new ServerError('Failed to create catalog.')
    );
  }
};

module.exports.getCatalogs = async (req, res, next) => {
  try {
    const userId = req.tokenData.userId;
    const catalogs = await catalogQueries.getUserCatalogs(userId);
    
    const responseData = catalogs.map((catalog) => ({
      id: catalog.id,
      catalogName: catalog.catalogName,
      chats: catalog.Conversations
        ? catalog.Conversations.map((conv) => conv.id)
        : [],
    }));

    res.send(responseData);
  } catch (err) {
    next(
      err instanceof Error ? err : new ServerError('Failed to get catalogs.')
    );
  }
};

module.exports.updateNameCatalog = async (req, res, next) => {
  try {
    const { catalogId, catalogName } = req.body;
    if (!catalogId || !catalogName)
      throw new BadRequestError('Catalog ID and name are required.');

    const catalog = await catalogQueries.updateCatalogName(
      req.tokenData.userId,
      catalogId,
      catalogName
    );

    if (!catalog) throw new NotFoundError('Catalog not found.');

    const responseData = {
      id: catalog.id,
      catalogName: catalog.catalogName,
      chats: catalog.Conversations
        ? catalog.Conversations.map((conv) => conv.id)
        : [],
    };

    res.send(responseData);
  } catch (err) {
    next(
      err instanceof Error
        ? err
        : new ServerError('Failed to update catalog name.')
    );
  }
};

module.exports.addNewChatToCatalog = async (req, res, next) => {
  try {
    const { catalogId, chatId } = req.body;
    if (!catalogId || !chatId)
      throw new BadRequestError('Catalog ID and Chat ID are required.');

    await catalogQueries.addChatToCatalog(catalogId, chatId);

    const catalog = await catalogQueries.getCatalogWithChats(catalogId);

    if (!catalog) throw new NotFoundError('Catalog not found.');

    const responseData = {
      id: catalog.id,
      catalogName: catalog.catalogName,
      chats: catalog.Conversations
        ? catalog.Conversations.map((conv) => conv.id)
        : [],
    };

    res.send(responseData);
  } catch (err) {
    next(
      err instanceof Error
        ? err
        : new ServerError('Failed to add chat to catalog.')
    );
  }
};

module.exports.removeChatFromCatalog = async (req, res, next) => {
  try {
    const { catalogId, chatId } = req.body;
    if (!catalogId || !chatId)
      throw new BadRequestError('Catalog ID and Chat ID are required.');

    const catalogOwnership = await catalogQueries.getUserCatalogById(
      req.tokenData.userId,
      catalogId
    );
    if (!catalogOwnership) throw new NotFoundError('Catalog not found.');

    const result = await catalogQueries.removeChatFromCatalog(
      catalogId,
      chatId
    );
    if (result === 0) throw new NotFoundError('Chat not found in catalog.');
 
    const catalog = await catalogQueries.getCatalogWithChats(catalogId);
    if (!catalog)
      throw new ServerError('Failed to fetch catalog after removal.');

    const responseData = {
      id: catalog.id,
      catalogName: catalog.catalogName,
      chats: catalog.Conversations
        ? catalog.Conversations.map((conv) => conv.id)
        : [],
    };

    res.send(responseData);
  } catch (err) {
    next(
      err instanceof Error
        ? err
        : new ServerError('Failed to remove chat from catalog.')
    );
  }
};

module.exports.deleteCatalog = async (req, res, next) => {
  try {
    const { catalogId } = req.body;
    if (!catalogId) throw new BadRequestError('Catalog ID is required.');

    const deleted = await catalogQueries.deleteUserCatalog(
      req.tokenData.userId,
      catalogId
    );

    if (!deleted) throw new NotFoundError('Catalog not found.');

    res.status(204).end(); 
  } catch (err) {
    next(
      err instanceof Error ? err : new ServerError('Failed to delete catalog.')
    );
  }
};
