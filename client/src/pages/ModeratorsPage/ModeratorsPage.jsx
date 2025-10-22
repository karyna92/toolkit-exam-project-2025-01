import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getContestsWithOffers,
  updateOfferStatus,
} from '../../store/slices/contestsWithOffersSlice';
import { setOfferStatus } from '../../store/slices/contestByIdSlice';
import ListControllers from '../../components/ModeratorsControllers/ListControllers';
import OffersList from '../../components/OffersList/OffersList';
import Pagination from '../../components/Pagination/Pagination';
import styles from './moderatorsPage.module.sass';

const ModeratorsPage = () => {
  const dispatch = useDispatch();
  const [filter, setFilter] = useState('pending');
  const [sortBy, setSortBy] = useState('newest');
  const [loadingOffers, setLoadingOffers] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const contestsWithOffers = useSelector(
    (state) => state.contestsWithOffers.contestsWithOffers || []
  );
  const pagination = useSelector((state) => state.contestsWithOffers.pagination);
  const isFetchingOffers = useSelector(
    (state) => state.contestsWithOffers.isFetching
  );
  useEffect(() => {
    const params = {
      page: currentPage,
    };

    if (filter !== 'all') {
      params.status = filter;
    }

    dispatch(getContestsWithOffers(params));
  }, [dispatch, currentPage, filter]);

  const getAllOffers = useMemo(() => {
    return contestsWithOffers.flatMap((contest) => contest.Offers || []);
  }, [contestsWithOffers]);

  const sortedOffers = useMemo(() => {
    let offersToSort = [...getAllOffers];
    console.log('sortedOffers', offersToSort);

    switch (sortBy) {
      case 'newest':
        return offersToSort.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      case 'oldest':
        return offersToSort.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      case 'contest':
        return offersToSort.sort((a, b) => a.contestId - b.contestId);
      default:
        return offersToSort;
    }
  }, [getAllOffers, sortBy]);

  const handleSetOfferStatus = async (offerId, userId, command) => {
    setLoadingOffers((prev) => ({ ...prev, [offerId]: true }));
    try {
      const newStatus = command === 'approve' ? 'approved' : 'declined';
      console.error('Could not find offer:', offerId);
      const offer = getAllOffers.find((o) => o.id === offerId);
      if (!offer) {
        console.error('Could not find offer:', offerId);
        throw new Error('Could not find offer');
      }
      console.log('Offer data:', offer);
      console.log('User ID from props:', userId);
      dispatch(updateOfferStatus({ offerId, status: newStatus }));

      const payload = {
        command: command,
        offerId: offerId,
        creatorId: userId,
        contestId: offer.contestId,
      };
      console.log('Sending payload:', payload);

      await dispatch(setOfferStatus(payload)).unwrap();
      const refreshParams = { page: currentPage };

      if (filter !== 'all') refreshParams.status = filter;
      dispatch(getContestsWithOffers(refreshParams));

      const params = {
        page: currentPage,
      };
      if (filter !== 'all') {
        params.status = filter;
      }
      dispatch(getContestsWithOffers(params));
    } catch (error) {
      console.error(
        `Error ${command === 'approve' ? 'approving' : 'declining'} offer:`,
        error
      );
    } finally {
      setLoadingOffers((prev) => ({ ...prev, [offerId]: false }));
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };
  const handleSortChange = (newSort) => {
    setSortBy(newSort);
  };

  if (isFetchingOffers) {
    return (
      <section className={styles.page}>
        <div className={styles.loading}>Loading contests and offers...</div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <h1 className={styles.pageTitle}>Offer Moderation</h1>

      <ListControllers
        filter={filter}
        sortBy={sortBy}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        showSort={true}
      />

      <OffersList
        contestsWithOffers={contestsWithOffers}
        offers={sortedOffers}
        filter={filter}
        handleSetOfferStatus={handleSetOfferStatus}
        loadingOffers={loadingOffers}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={pagination.totalPages}
        onPageChange={setCurrentPage}
        showPageNumbers={true}
      />
    </section>
  );
};

export default ModeratorsPage;
