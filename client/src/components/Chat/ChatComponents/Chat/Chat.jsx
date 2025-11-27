import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import DialogListContainer from '../../DialogComponents/DialogListContainer/DialogListContainer';
import styles from './Chat.module.sass';
import Dialog from '../../DialogComponents/Dialog/Dialog';
import {
  changeChatShow,
  setPreviewChatMode,
  getPreviewChat,
  changeChatFavorite,
  changeChatBlock,
} from '../../../../store/slices/chatSlice';
import { chatController } from '../../../../api/ws/socketController';
import CONSTANTS from '../../../../constants';
import CatalogListContainer from '../../CatalogComponents/CatalogListContainer/CatalogListContainer';
import CatalogCreation from '../../CatalogComponents/CatalogCreation/CatalogCreation';
import CatalogListHeader from '../../CatalogComponents/CatalogListHeader/CatalogListHeader';
import ChatError from '../../../ChatError/ChatError';

const Chat = () => {
  const dispatch = useDispatch();

  const {
    isExpanded,
    isShow,
    isShowCatalogCreation,
    error,
    chatData,
    chatMode,
    isShowChatsInCatalog,
  } = useSelector((state) => state.chatStore);

  const { data: userData } = useSelector((state) => state.userStore);
  const { id, role } = userData || {};

  useEffect(() => {
    if (id) {
      chatController.subscribeChat(id);
      dispatch(getPreviewChat());
    }

    return () => {
      if (id) {
        chatController.unsubscribeChat(id);
      }
    };
  }, [dispatch, id]);

  const handleFavoriteToggle = (chatData, event) => {
    if (event) event.stopPropagation();

    const { participants, id: conversationId, favoriteList = [] } = chatData;
    const userIndex = participants.indexOf(id);
    const isFavorite = userIndex !== -1 ? favoriteList[userIndex] : false;

    dispatch(
      changeChatFavorite({
        participants,
        favoriteFlag: !isFavorite,
        conversationId,
        userId: id,
      })
    );
  };

  const handleBlockToggle = (chatData, event) => {
    if (event) event.stopPropagation();

    const { participants, id: conversationId, blackList = [] } = chatData;
    const userIndex = participants.indexOf(id);
    const isBlocked = userIndex !== -1 ? blackList[userIndex] : false;

    dispatch(
      changeChatBlock({
        participants,
        blackListFlag: !isBlocked,
        conversationId,
        userId: id,
      })
    );
  };

  const handleChangeShow = () => {
    dispatch(changeChatShow());
  };

  const handleSetChatPreviewMode = (mode) => {
    dispatch(setPreviewChatMode(mode));
  };

  const handleGetPreviewChat = () => {
    dispatch(getPreviewChat());
  };

  const renderDialogList = () => {
    const {
      NORMAL_PREVIEW_CHAT_MODE,
      FAVORITE_PREVIEW_CHAT_MODE,
      BLOCKED_PREVIEW_CHAT_MODE,
      CATALOG_PREVIEW_CHAT_MODE,
    } = CONSTANTS;

    return (
      <div>
        {isShowChatsInCatalog && <CatalogListHeader />}
        {!isShowChatsInCatalog && (
          <div className={styles.chatHeader}>
            <img src={`${CONSTANTS.STATIC_IMAGES_PATH}logo.png`} alt="logo" />
          </div>
        )}
        {!isShowChatsInCatalog && (
          <div className={styles.buttonsContainer}>
            <span
              onClick={() => handleSetChatPreviewMode(NORMAL_PREVIEW_CHAT_MODE)}
              className={classNames(styles.button, {
                [styles.activeButton]: chatMode === NORMAL_PREVIEW_CHAT_MODE,
              })}
            >
              Normal
            </span>
            <span
              onClick={() =>
                handleSetChatPreviewMode(FAVORITE_PREVIEW_CHAT_MODE)
              }
              className={classNames(styles.button, {
                [styles.activeButton]: chatMode === FAVORITE_PREVIEW_CHAT_MODE,
              })}
            >
              Favorite
            </span>
            <span
              onClick={() =>
                handleSetChatPreviewMode(BLOCKED_PREVIEW_CHAT_MODE)
              }
              className={classNames(styles.button, {
                [styles.activeButton]: chatMode === BLOCKED_PREVIEW_CHAT_MODE,
              })}
            >
              Blocked
            </span>
            <span
              onClick={() =>
                handleSetChatPreviewMode(CATALOG_PREVIEW_CHAT_MODE)
              }
              className={classNames(styles.button, {
                [styles.activeButton]: chatMode === CATALOG_PREVIEW_CHAT_MODE,
              })}
            >
              Catalog
            </span>
          </div>
        )}
        {chatMode === CATALOG_PREVIEW_CHAT_MODE ? (
          <CatalogListContainer />
        ) : (
          <DialogListContainer
            userId={id}
            onFavoriteToggle={handleFavoriteToggle}
            onBlockToggle={handleBlockToggle}
          />
        )}
      </div>
    );
  };

  const isNotModerator = role !== CONSTANTS.MODERATOR;

  return (
    <div
      className={classNames(styles.chatContainer, {
        [styles.showChat]: isShow,
      })}
    >
      {error && <ChatError getData={handleGetPreviewChat} />}
      {isShowCatalogCreation && <CatalogCreation />}
      {isExpanded ? (
        <Dialog
          userId={id}
          chatData={chatData}
          onFavoriteToggle={handleFavoriteToggle}
          onBlockToggle={handleBlockToggle}
        />
      ) : (
        renderDialogList()
      )}

      {isNotModerator && (
        <div className={styles.toggleChat} onClick={handleChangeShow}>
          {isShow ? 'Hide Chat' : 'Show Chat'}
        </div>
      )}
    </div>
  );
};

export default Chat;
