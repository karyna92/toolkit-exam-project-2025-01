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
} from '../../store/slices/contestByIdSlice';
import CONSTANTS from '../../constants';
import styles from './OfferBox.module.sass';
import 'react-confirm-alert/src/react-confirm-alert.css';

const offerStatusCommands = {
  resolve: {
    title: 'Resolve Offer',
    message: 'Are you sure you want to resolve this offer as winner?',
    label: 'Yes, Resolve',
  },
  reject: {
    title: 'Reject Offer',
    message: 'Are you sure you want to reject this offer?',
    label: 'Yes, Reject',
  },
  approve: {
    title: 'Approve Offer',
    message: 'Are you sure you want to approve this offer?',
    label: 'Yes, Approve',
  },
  decline: {
    title: 'Decline Offer',
    message: 'Are you sure you want to decline this offer?',
    label: 'Yes, Decline',
  },
};

const getVisibleStatusesForRole = (role) => {
  switch (role) {
    case CONSTANTS.CUSTOMER:
      return [
        CONSTANTS.OFFER_STATUS_APPROVED,
        CONSTANTS.OFFER_STATUS_WON,
        CONSTANTS.OFFER_STATUS_REJECTED,
      ];
    case CONSTANTS.MODERATOR:
      return [
        CONSTANTS.OFFER_STATUS_PENDING,
        CONSTANTS.OFFER_STATUS_APPROVED,
        CONSTANTS.OFFER_STATUS_DECLINED,
        CONSTANTS.OFFER_STATUS_WON,
        CONSTANTS.OFFER_STATUS_REJECTED,
      ];
    case CONSTANTS.CREATOR:
      return [
        CONSTANTS.OFFER_STATUS_PENDING,
        CONSTANTS.OFFER_STATUS_APPROVED,
        CONSTANTS.OFFER_STATUS_DECLINED,
        CONSTANTS.OFFER_STATUS_WON,
        CONSTANTS.OFFER_STATUS_REJECTED,
      ];
    default:
      return [];
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case CONSTANTS.OFFER_STATUS_APPROVED:
      return styles.approved;
    case CONSTANTS.OFFER_STATUS_DECLINED:
      return styles.declined;
    case CONSTANTS.OFFER_STATUS_PENDING:
      return styles.pending;
    case CONSTANTS.OFFER_STATUS_REJECTED:
      return styles.reject;
    case CONSTANTS.OFFER_STATUS_WON:
      return styles.resolve;
    default:
      return '';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case CONSTANTS.OFFER_STATUS_REJECTED:
    case CONSTANTS.OFFER_STATUS_DECLINED:
      return 'fas fa-times-circle';
    case CONSTANTS.OFFER_STATUS_WON:
      return 'fas fa-check-circle';
    default:
      return null;
  }
};

const getStatusText = (status) => {
  switch (status) {
    case CONSTANTS.OFFER_STATUS_APPROVED:
      return 'approved';
    case CONSTANTS.OFFER_STATUS_DECLINED:
      return 'declined';
    case CONSTANTS.OFFER_STATUS_PENDING:
      return 'pending';
    case CONSTANTS.OFFER_STATUS_REJECTED:
      return 'rejected';
    case CONSTANTS.OFFER_STATUS_WON:
      return 'won';
    default:
      return status;
  }
};

const OfferBox = ({ data, needButtons, setOfferStatus, contestType }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const id = useSelector((state) => state.userStore.data.id);
  const role = useSelector((state) => state.userStore.data.role);
  const messagesPreview = useSelector(
    (state) => state.chatStore.messagesPreview
  );

  const visibleStatuses = getVisibleStatusesForRole(role);
  const isOfferVisible = visibleStatuses.includes(data.status);

  if (!isOfferVisible) {
    return null;
  }

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

  const confirmStatusChange = (command) => {
    const cmd = offerStatusCommands[command];
    if (!cmd) return;

    confirmAlert({
      title: cmd.title,
      message: cmd.message,
      buttons: [
        {
          label: cmd.label,
          onClick: () => setOfferStatus(data.User.id, data.id, command),
        },
        { label: 'No' },
      ],
    });
  };

  const resolveOffer = () => confirmStatusChange('resolve');
  const rejectOffer = () => confirmStatusChange('reject');
  const approveOffer = () => confirmStatusChange('approve');
  const declineOffer = () => confirmStatusChange('decline');

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

  const openLogoFile = () => {
    if (data.fileName) {
      const fileUrl = `${CONSTANTS.FILE_BASE_URL}/${data.fileName}`;
      window.open(fileUrl, '_blank');
    }
  };

  const renderOfferStatus = () => {
    const { status } = data;
    const statusClass = getStatusClass(status);
    const statusIcon = getStatusIcon(status);
    const statusText = getStatusText(status);

    if (role === CONSTANTS.CUSTOMER) {
      if (
        status === CONSTANTS.OFFER_STATUS_APPROVED ||
        status === CONSTANTS.OFFER_STATUS_PENDING ||
        status === CONSTANTS.OFFER_STATUS_DECLINED
      ) {
        return null;
      }

      if (statusIcon) {
        return (
          <i
            className={classNames(statusIcon, statusClass)}
            title={statusText}
          />
        );
      }
      return null;
    }

    if (statusIcon) {
      return (
        <i className={classNames(statusIcon, statusClass)} title={statusText} />
      );
    }
    return <span className={classNames(statusClass)}>{statusText}</span>;
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

  const canRateOffer =
    data.User.id !== id &&
    role !== CONSTANTS.CUSTOMER &&
    data.status !== CONSTANTS.OFFER_STATUS_PENDING &&
    data.status !== CONSTANTS.OFFER_STATUS_DECLINED;

  const { avatar, firstName, lastName, email, rating } = data.User;

  return (
    <div className={styles.offerContainer}>
      {renderOfferStatus()}

      <div className={styles.mainInfoContainer}>
        <div className={styles.userInfo}>
          <div className={styles.creativeInfoContainer}>
            <img
              src={
                avatar === 'anon.png'
                  ? CONSTANTS.ANONYM_IMAGE_PATH
                  : `${CONSTANTS.FILE_BASE_URL}/${avatar}`
              }
              alt={`${firstName} ${lastName}`}
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
                onClick={openLogoFile}
                className={styles.responseLogo}
                src={`${CONSTANTS.FILE_BASE_URL}/${data.fileName}`}
                alt="logo"
              />
              <div className={styles.logoHint}>Click to open full size</div>
            </div>
          ) : (
            <span className={styles.response}>{data.text}</span>
          )}

          {canRateOffer && (
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

        {role !== CONSTANTS.CREATOR && data.User.id !== id && (
          <i onClick={goChat} className="fas fa-comments" title="Go to chat" />
        )}
      </div>

      {role === CONSTANTS.CUSTOMER &&
        data.status === CONSTANTS.OFFER_STATUS_APPROVED && (
          <div className={styles.btnsContainer}>
            <div onClick={resolveOffer} className={styles.resolveBtn}>
              Resolve
            </div>
            <div onClick={rejectOffer} className={styles.rejectBtn}>
              Reject
            </div>
          </div>
        )}

      {role === CONSTANTS.MODERATOR &&
        data.status === CONSTANTS.OFFER_STATUS_PENDING && (
          <div className={styles.btnsContainer}>
            <div onClick={approveOffer} className={styles.approveBtn}>
              Approve
            </div>
            <div onClick={declineOffer} className={styles.declineBtn}>
              Decline
            </div>
          </div>
        )}
    </div>
  );
};

export default OfferBox;
