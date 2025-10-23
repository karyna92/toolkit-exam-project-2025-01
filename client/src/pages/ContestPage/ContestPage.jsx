import React, { useEffect, useCallback, useState } from 'react';
import classNames from 'classnames';
import isEqual from 'lodash/isEqual';
import LightBox from 'react-18-image-lightbox';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { goToExpandedDialog } from '../../store/slices/chatSlice';
import {
  getContestById,
  setOfferStatus,
  clearSetOfferStatusError,
  changeEditContest,
  changeContestViewMode,
  changeShowImage,
} from '../../store/slices/contestByIdSlice';
import ContestSideBar from '../../components/ContestSideBar/ContestSideBar';
import OfferBox from '../../components/OfferBox/OfferBox';
import OfferForm from '../../components/OfferForm/OfferForm';
import Brief from '../../components/Brief/Brief';
import Spinner from '../../components/Spinner/Spinner';
import TryAgain from '../../components/TryAgain/TryAgain';
import Error from '../../components/Error/Error';
import Pagination from '../../components/Pagination/Pagination';
import CONSTANTS from '../../constants';
import 'react-18-image-lightbox/style.css';
import styles from './ContestPage.module.sass';

const ContestPage = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [offersPerPage] = useState(5);

  const contestByIdStore = useSelector((state) => state.contestByIdStore);
  const userData = useSelector((state) => state.userStore.data);
  const chatData = useSelector((state) => state.chatStore);

  const { role } = userData;
  const {
    isShowOnFull,
    imagePath,
    error,
    isFetching,
    isBrief,
    contestData,
    offers,
    setOfferStatusError,
  } = contestByIdStore;

  useEffect(() => {
    dispatch(changeEditContest(false));
    dispatch(getContestById({ contestId: params.id }));
  }, [dispatch, params.id]);

  const getFilteredOffers = useCallback(() => {
    if (role === CONSTANTS.MODERATOR || role === CONSTANTS.CREATOR) {
      return offers;
    } else if (role === CONSTANTS.CUSTOMER) {
      return offers.filter((offer) =>
        [
          CONSTANTS.OFFER_STATUS_APPROVED,
          CONSTANTS.OFFER_STATUS_WON,
          CONSTANTS.OFFER_STATUS_REJECTED,
        ].includes(offer.status)
      );
    }
    return offers;
  }, [offers, role]);

  const getCurrentOffers = useCallback(() => {
    const filteredOffers = getFilteredOffers();
    const indexOfLastOffer = currentPage * offersPerPage;
    const indexOfFirstOffer = indexOfLastOffer - offersPerPage;
    return filteredOffers.slice(indexOfFirstOffer, indexOfLastOffer);
  }, [getFilteredOffers, currentPage, offersPerPage]);

  const setOffersList = useCallback(() => {
    const currentOffers = getCurrentOffers();

    if (!currentOffers.length) {
      return (
        <div className={styles.notFound}>
          There is no suggestion at this moment
        </div>
      );
    }

    return currentOffers.map((offer) => (
      <OfferBox
        key={offer.id}
        data={offer}
        needButtons={needButtons}
        setOfferStatus={setOfferStatusHandler}
        contestType={contestData.contestType}
        date={new Date()}
      />
    ));
  }, [getCurrentOffers, contestData]);

const needButtons = (offerStatus) => {
  if (!contestData.User) return false;

  const contestCreatorId = contestData.User.id;
  const userId = userData.id; 
  const contestStatus = contestData.status;
  return (
    contestCreatorId === userId &&
    contestStatus === CONSTANTS.CONTEST_STATUS_ACTIVE &&
    offerStatus === CONSTANTS.OFFER_STATUS_APPROVED
  );
};

  const setOfferStatusHandler = (creatorId, offerId, command) => {
    dispatch(clearSetOfferStatusError());
    const { id, orderId, priority } = contestData;
    dispatch(
      setOfferStatus({
        command,
        offerId,
        creatorId,
        orderId,
        priority,
        contestId: id,
      })
    );
  };

  const findConversationInfo = (interlocutorId) => {
    const { messagesPreview } = chatData;
    const { id } = userData;
    const participants = [id, interlocutorId].sort((a, b) => a - b);

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

  const goChat = () => {
    const { User } = contestData;
    dispatch(
      goToExpandedDialog({
        interlocutor: User,
        conversationData: findConversationInfo(User.id),
      })
    );
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const filteredOffers = getFilteredOffers();
  const totalOffers = filteredOffers.length;
  const totalPages = Math.ceil(totalOffers / offersPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [offers, isBrief]);

  return (
    <div>
      {isShowOnFull && (
        <LightBox
          mainSrc={`${CONSTANTS.publicURL}${imagePath}`}
          onCloseRequest={() =>
            dispatch(changeShowImage({ isShowOnFull: false, imagePath: null }))
          }
        />
      )}
      {error ? (
        <div className={styles.tryContainer}>
          <TryAgain
            getData={() => dispatch(getContestById({ contestId: params.id }))}
          />
        </div>
      ) : isFetching ? (
        <div className={styles.containerSpinner}>
          <Spinner />
        </div>
      ) : (
        <div className={styles.mainInfoContainer}>
          <div className={styles.infoContainer}>
            <div className={styles.buttonsContainer}>
              <span
                onClick={() => dispatch(changeContestViewMode(true))}
                className={classNames(styles.btn, {
                  [styles.activeBtn]: isBrief,
                })}
              >
                Brief
              </span>
              <span
                onClick={() => dispatch(changeContestViewMode(false))}
                className={classNames(styles.btn, {
                  [styles.activeBtn]: !isBrief,
                })}
              >
                Offer
              </span>
            </div>
            {isBrief ? (
              <Brief contestData={contestData} role={role} goChat={goChat} />
            ) : (
              <div className={styles.offersContainer}>
                {role === CONSTANTS.CREATOR &&
                  contestData.status === CONSTANTS.CONTEST_STATUS_ACTIVE && (
                    <OfferForm
                      contestType={contestData.contestType}
                      contestId={contestData.id}
                      customerId={contestData.User.id}
                    />
                  )}
                {setOfferStatusError && (
                  <Error
                    data={setOfferStatusError.data}
                    status={setOfferStatusError.status}
                    clearError={() => dispatch(clearSetOfferStatusError())}
                  />
                )}
                <div className={styles.offers}>
                  {setOffersList()}
      
                  {totalPages > 1 && (
                    <div className={styles.offersPagination}>
                      <div className={styles.offersInfo}>
                        Showing {getCurrentOffers().length} of {totalOffers}{' '}
                        offers
                      </div>
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        showPageNumbers={true}
                        middlePagesCount={3}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <ContestSideBar
            contestData={contestData}
            totalEntries={
              offers.filter(
                (o) => o.status !== 'pending' && o.status !== 'declined'
              ).length
            }
          />
        </div>
      )}
    </div>
  );
};

export default ContestPage;
