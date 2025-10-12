import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import className from 'classnames';
import {
  getDialogMessages,
  clearMessageList,
} from '../../../../store/slices/chatSlice';
import ChatHeader from '../../ChatComponents/ChatHeader/ChatHeader';
import styles from './Dialog.module.sass';
import ChatInput from '../../ChatComponents/ChatInut/ChatInput';

class Dialog extends React.Component {
  componentDidMount() {
    const { interlocutor } = this.props;
    if (interlocutor?.id) {
      this.props.getDialog({ interlocutorId: interlocutor.id });
    }
    this.scrollToBottom();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.messages !== this.props.messages) {
      this.scrollToBottom();
    }
  }

  messagesEnd = React.createRef();

  scrollToBottom = () => {
    if (this.messagesEnd.current) {
      this.messagesEnd.current.scrollIntoView({
        behavior: 'auto',
        block: 'end',
        inline: 'nearest',
      });
    }
  };

  componentWillUnmount() {
    this.props.clearMessageList();
  }

  renderMainDialog = () => {
    const { messages, userId } = this.props;
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
        <div ref={this.messagesEnd} />
      </div>
    );
  };

  blockMessage = () => {
    const { userId, chatData } = this.props;

    if (!chatData || !chatData.blackList || !chatData.participants) {
      return null;
    }

    const userIndex = chatData.participants.indexOf(userId);
    let message;
    const firstName = this.props.interlocutor?.firstName || 'user';

    if (userIndex !== -1 && chatData.blackList[userIndex]) {
      message = `You blocked ${firstName}`;
    } else if (chatData.blackList.includes(true)) {
      message = `${firstName} blocked you`;
    }

    return message ? (
      <span className={styles.messageBlock}>{message}</span>
    ) : null;
  };

  render() {
    const { chatData, userId } = this.props;

    const isBlocked =
      chatData &&
      chatData.blackList &&
      Array.isArray(chatData.blackList) &&
      chatData.blackList.includes(true);

    return (
      <>
        <ChatHeader
          userId={userId}
          chatData={chatData}
          onBlockToggle={this.props.onBlockToggle}
          onFavoriteToggle={this.props.onFavoriteToggle}
        />
        {this.renderMainDialog()}
        {isBlocked ? this.blockMessage() : <ChatInput />}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  const { interlocutor, chatData, messages, optimisticStatus } =
    state.chatStore;
  const userId = state.userStore.data.id;

  if (!chatData) {
    return { interlocutor, chatData, messages, userId };
  }

  const optimisticData = optimisticStatus[chatData.id];

  if (!optimisticData) {
    return { interlocutor, chatData, messages, userId };
  }

  const targetUserId = optimisticData.userId || userId;
  const userIndex = chatData.participants.indexOf(targetUserId);

  if (userIndex === -1) {
    return { interlocutor, chatData, messages, userId };
  }

  const mergedChatData = {
    ...chatData,
    favoriteList: [...(chatData.favoriteList || [])],
    blackList: [...(chatData.blackList || [])],
  };

  if (optimisticData.favoriteList !== undefined) {
    mergedChatData.favoriteList[userIndex] = optimisticData.favoriteList;
  }

  if (optimisticData.blackList !== undefined) {
    mergedChatData.blackList[userIndex] = optimisticData.blackList;
  }

  return {
    interlocutor,
    chatData: mergedChatData,
    messages,
    userId,
  };
};

const mapDispatchToProps = (dispatch) => ({
  getDialog: (data) => dispatch(getDialogMessages(data)),
  clearMessageList: () => dispatch(clearMessageList()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dialog);
