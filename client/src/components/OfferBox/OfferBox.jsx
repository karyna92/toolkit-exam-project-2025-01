import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Rating from 'react-rating';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';
import { confirmAlert } from 'react-confirm-alert';
import { goToExpandedDialog } from '../../store/slices/chatSlice';
import {
  changeMark,
  clearChangeMarkError,
  changeShowImage,
} from '../../store/slices/contestByIdSlice';
import CONSTANTS from '../../constants';
import styles from './OfferBox.module.sass';
import 'react-confirm-alert/src/react-confirm-alert.css';
import './confirmStyle.css';

const OfferBox = ({ data, needButtons, setOfferStatus, contestType }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const id = useSelector((state) => state.userStore.data.id);
  const role = useSelector((state) => state.userStore.data.role);
  const messagesPreview = useSelector(
    (state) => state.chatStore.messagesPreview
  );

  const findConversationInfo = () => {
    const participants = [id, data.User.id].sort((a, b) => a - b);

    for (let i = 0; i < messagesPreview.length; i++) {
      if (isEqual(participants, messagesPreview[i].participants)) {
        return {
          participants: messagesPreview[i].participants,
          id: messagesPreview[i].id,
          blackList: messagesPreview[i].blackList,
          favoriteList: messagesPreview[i].favoriteList,
        };
      }
    }
    return null;
  };

  const resolveOffer = () => {
    confirmAlert({
      title: 'Confirm',
      message: 'Are you sure?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => setOfferStatus(data.User.id, data.id, 'resolve'),
        },
        { label: 'No' },
      ],
    });
  };

  const rejectOffer = () => {
    confirmAlert({
      title: 'Confirm',
      message: 'Are you sure?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => setOfferStatus(data.User.id, data.id, 'reject'),
        },
        { label: 'No' },
      ],
    });
  };

  const changeUserMark = (value) => {
    dispatch(clearChangeMarkError());
    dispatch(
      changeMark({
        mark: value,
        offerId: data.id,
        isFirst: !data.mark,
        creatorId: data.User.id,
      })
    );
  };

  // Нова функція для відкриття файлу
  const openLogoFile = () => {
    if (data.fileName) {
      const fileUrl = `${CONSTANTS.FILE_BASE_URL}/${data.fileName}`;
      window.open(fileUrl, '_blank');
    }
  };

  const offerStatus = () => {
    const { status } = data;

    if (role === CONSTANTS.CREATOR) {
      switch (status) {
        case CONSTANTS.OFFER_STATUS_APPROVED:
          return <span className={classNames(styles.approved)}>approved</span>;

        case CONSTANTS.OFFER_STATUS_DECLINED:
          return <span className={classNames(styles.declined)}>declined</span>;

        case CONSTANTS.OFFER_STATUS_PENDING:
          return <span className={classNames(styles.pending)}>pending</span>;
        case CONSTANTS.OFFER_STATUS_REJECTED:
          return (
            <i
              className={classNames(
                'fas fa-times-circle reject',
                styles.reject
              )}
            />
          );

        case CONSTANTS.OFFER_STATUS_WON:
          return (
            <i
              className={classNames(
                'fas fa-check-circle resolve',
                styles.resolve
              )}
            />
          );

        default:
          return null;
      }
    }

    switch (status) {
      case CONSTANTS.OFFER_STATUS_REJECTED:
        return (
          <i
            className={classNames('fas fa-times-circle reject', styles.reject)}
          />
        );

      case CONSTANTS.OFFER_STATUS_WON:
        return (
          <i
            className={classNames(
              'fas fa-check-circle resolve',
              styles.resolve
            )}
          />
        );

      default:
        return null;
    }
  };

  const goChat = () => {
    dispatch(
      goToExpandedDialog({
        interlocutor: data.User,
        conversationData: findConversationInfo() || {
          id: null,
          participants: [id, data.User.id],
          blackList: [false, false],
          favoriteList: [false, false],
        },
      })
    );
    navigate('/chat');
  };

  const { avatar, firstName, lastName, email, rating } = data.User;

  return (
    <div className={styles.offerContainer}>
      {offerStatus()}
      <div className={styles.mainInfoContainer}>
        <div className={styles.userInfo}>
          <div className={styles.creativeInfoContainer}>
            <img
              src={
                avatar === 'anon.png'
                  ? CONSTANTS.ANONYM_IMAGE_PATH
                  : `${CONSTANTS.FILE_BASE_URL}/${avatar}`
              }
              alt="user"
            />
            <div className={styles.nameAndEmail}>
              <span>{`${firstName} ${lastName}`}</span>
              <span>{email}</span>
            </div>
          </div>
          <div className={styles.creativeRating}>
            <span className={styles.userScoreLabel}>Creative Rating </span>
            <Rating
              initialRating={rating}
              fractions={2}
              fullSymbol={
                <img
                  src={`${CONSTANTS.STATIC_IMAGES_PATH}star.png`}
                  alt="star"
                />
              }
              emptySymbol={
                <img
                  src={`${CONSTANTS.STATIC_IMAGES_PATH}star-outline.png`}
                  alt="star-outline"
                />
              }
              readonly
            />
          </div>
        </div>

        <div className={styles.responseConainer}>
          {contestType === CONSTANTS.LOGO_CONTEST ? (
            <div className={styles.logoContainer}>
              <img
                onClick={openLogoFile} // Змінено на нову функцію
                className={styles.responseLogo}
                src={`${CONSTANTS.FILE_BASE_URL}/${data.fileName}`}
                alt="logo"
              />
              <div className={styles.logoHint}>Click to open full size</div>
            </div>
          ) : (
            <span className={styles.response}>{data.text}</span>
          )}

          {data.User.id !== id && (
            <Rating
              fractions={2}
              fullSymbol={
                <img
                  src={`${CONSTANTS.STATIC_IMAGES_PATH}star.png`}
                  alt="star"
                />
              }
              emptySymbol={
                <img
                  src={`${CONSTANTS.STATIC_IMAGES_PATH}star-outline.png`}
                  alt="star-outline"
                />
              }
              onClick={changeUserMark}
              placeholderRating={data.mark}
            />
          )}
        </div>

        {role !== CONSTANTS.CREATOR && (
          <i onClick={goChat} className="fas fa-comments" />
        )}
      </div>

      {needButtons(data.status) && (
        <div className={styles.btnsContainer}>
          <div onClick={resolveOffer} className={styles.resolveBtn}>
            Resolve
          </div>
          <div onClick={rejectOffer} className={styles.rejectBtn}>
            Reject
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferBox;
