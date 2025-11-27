import React from 'react';
import { useOffersModeration } from '../../hooks/useOffersModeration';
import ListControllers from '../../components/ModeratorsControllers/ListControllers';
import OffersList from '../../components/OffersList/OffersList';
import Pagination from '../../components/Pagination/Pagination';
import styles from './moderatorsPage.module.sass';

const ModeratorsPage = () => {
  const {
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
  } = useOffersModeration();

  if (isFetchingOffers) {
    return (
      <section className={styles.page}>
        <p>Loading...</p>
      </section>
    );
  }

  if (!contestsWithOffers.length && !isFetchingOffers) {
    return (
      <section className={styles.page}>
        <div className={styles.emptyState}>
          <h1 className={styles.pageTitle}>Offer Moderation</h1>
          <p>No offers found for the current filters.</p>
        </div>
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
        onPageChange={handlePageChange}
        showPageNumbers={true}
      />
    </section>
  );
};

export default ModeratorsPage;
