import React from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import styles from './DialogBox.module.sass';
import CONSTANTS from '../../../../constants';

const DialogBox = (props) => {
  const {
    userId,
    getTimeStr,
    catalogOperation,
    goToExpandedDialog,
    chatMode,
    interlocutor,
    onFavoriteToggle,
    onBlockToggle,
  } = props;

  const { messagesPreview, optimisticStatus } = useSelector(
    (state) => state.chatStore
  );

  const apiChatData =
    messagesPreview.find((preview) => preview.id === props.chatPreview.id) ||
    props.chatPreview;

  const optimisticData = optimisticStatus[apiChatData.id];

  let chatPreview = apiChatData;
  if (optimisticData) {
    const targetUserId = optimisticData.userId || userId;
    const userIndex = apiChatData.participants.indexOf(targetUserId);

    if (userIndex !== -1) {
      chatPreview = {
        ...apiChatData,
        ...(optimisticData.favoriteList !== undefined && {
          favoriteList: apiChatData.favoriteList.map((val, idx) =>
            idx === userIndex ? optimisticData.favoriteList : val
          ),
        }),
        ...(optimisticData.blackList !== undefined && {
          blackList: apiChatData.blackList.map((val, idx) =>
            idx === userIndex ? optimisticData.blackList : val
          ),
        }),
      };
    }
  }

  const {
    text,
    id,
    createdAt,
    participants,
    favoriteList = [],
    blackList = [],
  } = chatPreview;

  const userIndex = participants.indexOf(userId);
  const isFavorite = userIndex !== -1 ? favoriteList[userIndex] : false;
  const isBlocked = userIndex !== -1 ? blackList[userIndex] : false;

  const handleFavoriteClick = (event) => {
    onFavoriteToggle(chatPreview, event);
  };

  const handleBlockClick = (event) => {
    onBlockToggle(chatPreview, event);
  };

  const handleGoToExpandedDialog = () => {
    goToExpandedDialog({
      interlocutor,
      conversationData: {
        participants,
        id,
        blackList,
        favoriteList,
      },
    });
  };

  return (
    <div className={styles.previewChatBox} onClick={handleGoToExpandedDialog}>
      <img
        src={
          interlocutor.avatar === 'anon.png'
            ? CONSTANTS.ANONYM_IMAGE_PATH
            : `${CONSTANTS.publicURL}${interlocutor.avatar}`
        }
        alt="user"
      />
      <div className={styles.infoContainer}>
        <div className={styles.interlocutorInfo}>
          <span className={styles.interlocutorName}>
            {interlocutor.firstName}
          </span>
          <span className={styles.interlocutorMessage}>{text}</span>
        </div>
        <div className={styles.buttonsContainer}>
          <span className={styles.time}>{getTimeStr(createdAt)}</span>
          <i
            onClick={handleFavoriteClick}
            className={classNames({
              'far fa-heart': !isFavorite,
              'fas fa-heart': isFavorite,
              [styles.favoriteActive]: isFavorite,
            })}
            style={{ color: isFavorite ? 'red' : 'inherit' }}
          />
          <i
            onClick={handleBlockClick}
            className={classNames({
              'fas fa-user-lock': isBlocked,
              'fas fa-unlock': !isBlocked,
            })}
            style={{ color: isBlocked ? 'red' : 'inherit' }}
          />
          <i
            onClick={(event) => catalogOperation(event, id)}
            className={classNames({
              'far fa-plus-square':
                chatMode !== CONSTANTS.CATALOG_PREVIEW_CHAT_MODE,
              'fas fa-minus-circle':
                chatMode === CONSTANTS.CATALOG_PREVIEW_CHAT_MODE,
            })}
          />
        </div>
      </div>
    </div>
  );
};

export default DialogBox;
