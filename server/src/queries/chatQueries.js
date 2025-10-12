const db = require('../models');
const { ServerError, BadRequestError } = require('../errors');

module.exports.createMessage = async (
  senderId,
  conversationId,
  messageBody
) => {
  if (typeof senderId === 'object' && senderId !== null) {
    const params = senderId;
    const extractedSenderId = params.senderId || params.sender;
    const extractedConversationId =
      params.conversationId || params.conversation;
    const extractedMessageBody =
      params.messageBody || params.body || params.text;

    senderId = extractedSenderId;
    conversationId = extractedConversationId;
    messageBody = extractedMessageBody;
  }

  if (!conversationId) {
    throw new BadRequestError('Conversation ID is required.');
  }
  if (!messageBody) {
    throw new BadRequestError('Message body is required.');
  }
  if (!senderId) {
    throw new BadRequestError('Sender ID is required.');
  }

  const message = await db.Messages.create({
    senderId,
    body: messageBody,
    conversationId,
  });

  return message;
};

module.exports.getUserConversations = async (userId) => {
  try {
    const result = await db.ConversationToParticipants.findAll({
      where: { userId },
      include: [
        {
          model: db.Conversations,
          include: [
            {
              model: db.Users,
              as: 'participants',
              through: { attributes: ['blackList', 'favoriteList'] },
            },
            {
              model: db.Messages,
              as: 'messages',
              separate: true,
              order: [['createdAt', 'DESC']],
              limit: 1,
            },
          ],
        },
      ],
    });
    return result;
  } catch (err) {
    throw new ServerError('Failed to get user conversations');
  }
};

module.exports.getConversationParticipants = async (conversationId) => {
  try {
    const participants = await db.ConversationToParticipants.findAll({
      where: { conversationId },
      attributes: ['userId', 'blackList', 'favoriteList'],
      order: [['userId', 'ASC']],
    });
    return participants;
  } catch (err) {
    throw new ServerError('Failed to get conversation participants');
  }
};

module.exports.getPreviewData = async (userId) => {
  return await db.Conversations.findAll({
    include: [
      {
        model: db.Users,
        as: 'participants',
        through: { attributes: ['blackList', 'favoriteList'] },
      },
      {
        model: db.Messages,
        as: 'messages',
        separate: true,
        order: [['createdAt', 'DESC']],
        limit: 1,
      },
    ],
    where: db.Sequelize.literal(`
      EXISTS (
        SELECT 1 FROM "ConversationToParticipants"
        WHERE "ConversationToParticipants"."conversationId" = "Conversations"."id"
        AND "ConversationToParticipants"."userId" = ${userId}
      )
    `),
  });
};
module.exports.findOrCreateConversation = async (participants) => {
  const existing = await db.ConversationToParticipants.findAll({
    attributes: ['conversationId'],
    where: { userId: { [db.Sequelize.Op.in]: participants } },
    group: ['conversationId'],
    having: db.sequelize.literal(
      `COUNT(DISTINCT "userId") = ${participants.length}`
    ),
    raw: true,
  });

  if (existing.length > 0) {
    const conversationId = existing[0].conversationId;
    const conversation = await db.Conversations.findByPk(conversationId, {
      include: [
        {
          model: db.Users,
          as: 'participants',
          attributes: ['id'],
          through: { attributes: [] },
        },
      ],
    });
    return conversation;
  }

  const conversation = await db.Conversations.create({});
  await db.ConversationToParticipants.bulkCreate([
    {
      conversationId: conversation.id,
      userId: participants[0],
      blackList: false,
      favoriteList: false,
    },
    {
      conversationId: conversation.id,
      userId: participants[1],
      blackList: false,
      favoriteList: false,
    },
  ]);

  return await db.Conversations.findByPk(conversation.id, {
    include: [
      {
        model: db.Users,
        as: 'participants',
        attributes: ['id'],
        through: { attributes: [] },
      },
    ],
  });
};

module.exports.getConversationMessages = async (conversationId) => {
  return await db.Messages.findAll({
    where: { conversationId },
    order: [['createdAt', 'ASC']],
    attributes: [
      'id',
      'senderId',
      'body',
      'conversationId',
      'createdAt',
      'updatedAt',
    ],
  });
};

module.exports.updateBlackListFlag = async (
  conversationId,
  userId,
  blackListFlag
) => {
  try {
    const [updated] = await db.ConversationToParticipants.update(
      { blackList: blackListFlag },
      { where: { conversationId, userId } }
    );

    return updated;
  } catch (err) {
    throw new ServerError('Failed to update blacklist.');
  }
};

module.exports.updateFavoriteFlag = async (
  conversationId,
  userId,
  favoriteFlag
) => {
  const [updated] = await db.ConversationToParticipants.update(
    { favoriteList: favoriteFlag },
    { where: { conversationId, userId } }
  );
  return updated;
};

module.exports.getConversationWithParticipants = async (conversationId) => {
  try {
    const conversation = await db.Conversations.findByPk(conversationId, {
      include: [
        {
          model: db.Users,
          as: 'participants',
          through: { attributes: ['blackList', 'favoriteList'] },
        },
      ],
    });
    return conversation;
  } catch (err) {
    throw new ServerError('Failed to fetch conversation.');
  }
};
