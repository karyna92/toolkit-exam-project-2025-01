import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import className from 'classnames';
import {
  getDialogMessages,
  clearMessageList,
} from '../../../../store/slices/chatSlice';
import ChatHeader from '../../ChatComponents/ChatHeader/ChatHeader';
import styles from './Dialog.module.sass';
import ChatInput from '../../ChatComponents/ChatInut/ChatInput';

const Dialog = ({ onFavoriteToggle, onBlockToggle }) => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);

  const { interlocutor, chatData, messages, optimisticStatus } = useSelector(
    (state) => state.chatStore
  );
  const userId = useSelector((state) => state.userStore.data.id);

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

  useEffect(() => {
    if (interlocutor?.id) {
      dispatch(getDialogMessages({ interlocutorId: interlocutor.id }));
    }
    scrollToBottom();
  }, [dispatch, interlocutor]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      dispatch(clearMessageList());
    };
  }, [dispatch]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'auto',
        block: 'end',
        inline: 'nearest',
      });
    }
  };

  const renderMainDialog = () => {
    let currentTime = moment();
    const messagesArray = [];

    messages.forEach((message, i) => {
      if (!currentTime.isSame(message.createdAt, 'date')) {
        messagesArray.push(
          <div key={`date-${message.createdAt}`} className={styles.date}>
            {moment(message.createdAt).format('MMMM DD, YYYY')}
          </div>
        );
        currentTime = moment(message.createdAt);
      }

      messagesArray.push(
        <div
          key={i}
          className={className(
            userId === message.senderId ? styles.ownMessage : styles.message
          )}
        >
          <span>{message.body}</span>
          <span className={styles.messageTime}>
            {moment(message.createdAt).format('HH:mm')}
          </span>
        </div>
      );
    });

    return (
      <div className={styles.messageList}>
        {messagesArray}
        <div ref={messagesEndRef} />
      </div>
    );
  };

  const blockMessage = () => {
    if (
      !processedChatData ||
      !processedChatData.blackList ||
      !processedChatData.participants
    ) {
      return null;
    }

    const userIndex = processedChatData.participants.indexOf(userId);
    let message;
    const firstName = interlocutor?.firstName || 'user';

    if (userIndex !== -1 && processedChatData.blackList[userIndex]) {
      message = `You blocked ${firstName}`;
    } else if (processedChatData.blackList.includes(true)) {
      message = `${firstName} blocked you`;
    }

    return message ? (
      <span className={styles.messageBlock}>{message}</span>
    ) : null;
  };

  const isBlocked =
    processedChatData &&
    processedChatData.blackList &&
    Array.isArray(processedChatData.blackList) &&
    processedChatData.blackList.includes(true);

  return (
    <>
      <ChatHeader
        userId={userId}
        chatData={processedChatData}
        onBlockToggle={onBlockToggle}
        onFavoriteToggle={onFavoriteToggle}
      />
      {renderMainDialog()}
      {isBlocked ? blockMessage() : <ChatInput />}
    </>
  );
};

export default Dialog;
