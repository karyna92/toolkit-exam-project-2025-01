import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getContestsWithOffers,
  updateOfferStatus,
} from '../store/slices/contestsWithOffersSlice';
import { setOfferStatus } from '../store/slices/contestByIdSlice';
import { sortOffers } from '../utils/offerUtils';

export const useOffersModeration = () => {
  const dispatch = useDispatch();

  const [filter, setFilter] = useState('pending');
  const [sortBy, setSortBy] = useState('newest');
  const [loadingOffers, setLoadingOffers] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const contestsWithOffers = useSelector(
    (state) => state.contestsWithOffers.contestsWithOffers || []
  );
  const pagination = useSelector(
    (state) => state.contestsWithOffers.pagination
  );
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

  const pageOffers = useMemo(() => {
    return contestsWithOffers.flatMap((contest) => contest.Offers || []);
  }, [contestsWithOffers]);

  const sortedOffers = useMemo(() => {
    return sortOffers([...pageOffers], sortBy);
  }, [pageOffers, sortBy]);

  const handleSetOfferStatus = async (offerId, userId, command) => {
    setLoadingOffers((prev) => ({ ...prev, [offerId]: true }));

    try {
      const newStatus = command === 'approve' ? 'approved' : 'declined';

      const offer = pageOffers.find((o) => o.id === offerId);
      if (!offer) {
        console.error('Could not find offer:', offerId);
        throw new Error('Could not find offer');
      }

      dispatch(updateOfferStatus({ offerId, status: newStatus }));

      const payload = {
        command: command,
        offerId: offerId,
        creatorId: userId,
        contestId: offer.contestId,
      };

      await dispatch(setOfferStatus(payload)).unwrap();

      const refreshParams = { page: currentPage };
      if (filter !== 'all') refreshParams.status = filter;
      dispatch(getContestsWithOffers(refreshParams));
    } catch (error) {
      console.error(
        `Error ${command === 'approve' ? 'approving' : 'declining'} offer:`,
        error
      );
      throw error;
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

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return {
    filter,
    sortBy,
    loadingOffers,
    currentPage,

    contestsWithOffers,
    pagination,
    isFetchingOffers,
    sortedOffers,

    handleSetOfferStatus,
    handleFilterChange,
    handleSortChange,
    handlePageChange,

    setFilter,
    setSortBy,
    setCurrentPage,
  };
};
