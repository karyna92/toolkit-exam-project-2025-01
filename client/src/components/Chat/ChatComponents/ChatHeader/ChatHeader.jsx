import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { backToDialogList } from '../../../../store/slices/chatSlice';
import styles from './ChatHeader.module.sass';
import CONSTANTS from '../../../../constants';

const ChatHeader = ({ onFavoriteToggle, onBlockToggle }) => {
  const dispatch = useDispatch();

  const { interlocutor, chatData, optimisticStatus } = useSelector(
    (state) => state.chatStore
  );
  const userId = useSelector((state) => state.userStore.data.id);

  const handleBackToDialogList = () => {
    dispatch(backToDialogList());
  };

  let isFavorite = false;
  let isBlocked = false;

  let processedChatData = chatData;

  if (chatData && optimisticStatus && chatData.id) {
    const optimisticData = optimisticStatus[chatData.id];

    if (optimisticData) {
      processedChatData = {
        ...chatData,
        favoriteList: [...(chatData.favoriteList || [])],
        blackList: [...(chatData.blackList || [])],
      };

      const targetUserId = optimisticData.userId || userId;
      const userIndex = chatData.participants.indexOf(targetUserId);

      if (userIndex !== -1) {
        if (optimisticData.favoriteList !== undefined) {
          processedChatData.favoriteList[userIndex] =
            optimisticData.favoriteList;
        }
        if (optimisticData.blackList !== undefined) {
          processedChatData.blackList[userIndex] = optimisticData.blackList;
        }
      }
    }
  }

  if (processedChatData && processedChatData.participants) {
    const {
      participants,
      favoriteList = [],
      blackList = [],
    } = processedChatData;
    const userIndex = participants.indexOf(userId);
    isFavorite = userIndex !== -1 ? favoriteList[userIndex] : false;
    isBlocked = userIndex !== -1 ? blackList[userIndex] : false;
  }

  const handleFavoriteClick = (event) => {
    event.stopPropagation();
    onFavoriteToggle(processedChatData, event);
  };

  const handleBlockClick = (event) => {
    event.stopPropagation();
    onBlockToggle(processedChatData, event);
  };

  const { avatar, firstName } = interlocutor;

  return (
    <div className={styles.chatHeader}>
      <div className={styles.buttonContainer} onClick={handleBackToDialogList}>
        <img
          src={`${CONSTANTS.STATIC_IMAGES_PATH}arrow-left-thick.png`}
          alt="back"
        />
      </div>
      <div className={styles.infoContainer}>
        <div>
          <img
            src={
              avatar === 'anon.png'
                ? CONSTANTS.ANONYM_IMAGE_PATH
                : `${CONSTANTS.FILE_BASE_URL}/${avatar}`
            }
            alt="user"
          />
          <span>{firstName}</span>
        </div>
        {processedChatData && (
          <div>
            <i
              onClick={handleFavoriteClick}
              className={classNames({
                'far fa-heart': !isFavorite,
                'fas fa-heart': isFavorite,
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
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
