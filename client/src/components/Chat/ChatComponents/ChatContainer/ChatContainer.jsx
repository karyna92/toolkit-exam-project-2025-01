import React from 'react';
import { useSelector } from 'react-redux';
import Chat from '../Chat/Chat';

const ChatContainer = () => {
  const data = useSelector((state) => state.userStore.data);

  if (!data) return null;

  return data.role !== 'moderator' ? <Chat /> : null;
};

export default ChatContainer;
