import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPreviewChat } from '../../../../store/slices/chatSlice';
import DialogList from '../DialogList/DialogList';

const DialogListContainer = ({ userId, onFavoriteToggle, onBlockToggle }) => {
  const dispatch = useDispatch();
  const { messagesPreview } = useSelector((state) => state.chatStore);

  useEffect(() => {
    dispatch(getPreviewChat());
  }, [dispatch]);

  return (
    <DialogList
      preview={messagesPreview}
      userId={userId}
      onFavoriteToggle={onFavoriteToggle}
      onBlockToggle={onBlockToggle}
    />
  );
};

export default DialogListContainer;