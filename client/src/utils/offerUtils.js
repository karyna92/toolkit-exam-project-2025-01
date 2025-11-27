/**
 * Sort offers with proper date parsing and contest ID numerical comparison
 */
export const sortOffers = (offers, sortBy) => {
  if (!offers.length) return offers;

  const offersToSort = [...offers];

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
};

/**
 * Filter offers by status with 'all' as wildcard
 */
export const filterOffersByStatus = (offers, status) => {
  if (status === 'all') return offers;
  return offers.filter((offer) => offer.status === status);
};

/**
 * Group offers by contestId using reduce
 */
export const groupOffersByContest = (offers) => {
  return offers.reduce((acc, offer) => {
    const contestId = offer.contestId;
    if (!acc[contestId]) {
      acc[contestId] = [];
    }
    acc[contestId].push(offer);
    return acc;
  }, {});
};
