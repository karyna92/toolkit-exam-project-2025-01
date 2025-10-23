import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import CONSTANTS from '../../../../constants';
import {
  goToExpandedDialog,
  changeShowAddChatToCatalogMenu,
} from '../../../../store/slices/chatSlice';
import DialogBox from '../DialogBox/DialogBox';
import styles from './DialogList.module.sass';

const DialogList = (props) => {
  const dispatch = useDispatch();
  const { chatMode } = useSelector((state) => state.chatStore);

  const { userId, preview, removeChat, onBlockToggle, onFavoriteToggle } =
    props;

  const handleChangeShowCatalogCreation = (event, chatId) => {
    dispatch(changeShowAddChatToCatalogMenu(chatId));
    event.stopPropagation();
  };

  const handleGoToExpandedDialog = (data) => {
    dispatch(goToExpandedDialog(data));
  };

  const onlyFavoriteDialogs = (chatPreview, userId) => {
    const userIndex = chatPreview.participants.indexOf(userId);
    return userIndex !== -1 ? chatPreview.favoriteList[userIndex] : false;
  };

  const onlyBlockDialogs = (chatPreview, userId) => {
    const userIndex = chatPreview.participants.indexOf(userId);
    return userIndex !== -1 ? chatPreview.blackList[userIndex] : false;
  };

  const getTimeStr = (time) => {
    const currentTime = moment();
    if (currentTime.isSame(time, 'day')) return moment(time).format('HH:mm');
    if (currentTime.isSame(time, 'week')) return moment(time).format('dddd');
    if (currentTime.isSame(time, 'year')) return moment(time).format('MM DD');
    return moment(time).format('MMMM DD, YYYY');
  };

  const renderPreview = (filterFunc) => {
    const arrayList = [];

    preview.forEach((chatPreview, index) => {
      const dialogNode = (
        <DialogBox
          interlocutor={chatPreview.interlocutor}
          chatPreview={chatPreview}
          userId={userId}
          key={chatPreview.id}
          getTimeStr={getTimeStr}
          chatMode={chatMode}
          catalogOperation={
            chatMode === CONSTANTS.CATALOG_PREVIEW_CHAT_MODE
              ? removeChat
              : handleChangeShowCatalogCreation
          }
          goToExpandedDialog={handleGoToExpandedDialog}
          onFavoriteToggle={onFavoriteToggle}
          onBlockToggle={onBlockToggle}
        />
      );
      if (filterFunc && filterFunc(chatPreview, userId)) {
        arrayList.push(dialogNode);
      } else if (!filterFunc) {
        arrayList.push(dialogNode);
      }
    });
    return arrayList.length ? (
      arrayList
    ) : (
      <span className={styles.notFound}>Not found</span>
    );
  };

  const renderChatPreview = () => {
    if (chatMode === CONSTANTS.FAVORITE_PREVIEW_CHAT_MODE)
      return renderPreview(onlyFavoriteDialogs);
    if (chatMode === CONSTANTS.BLOCKED_PREVIEW_CHAT_MODE)
      return renderPreview(onlyBlockDialogs);
    return renderPreview();
  };

  return <div className={styles.previewContainer}>{renderChatPreview()}</div>;
};

export default DialogList;
