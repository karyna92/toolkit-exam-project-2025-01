import React from 'react';
import styles from './ListControllers.module.sass';

const ListControllers = ({
  filter,
  sortBy,
  onFilterChange,
  onSortChange,
  showSort = true,
}) => {
  const handleFilterChange = (newFilter) => {
    onFilterChange(newFilter);
  };

  return (
    <section className={styles.controlsSection}>
      <div className={styles.controls}>
        <div className={styles.filterGroup}>
          <label className={styles.groupLabel}>Filter by Status:</label>
          <div className={styles.filterButtons}>
            <button
              className={`${styles.filterButton} ${
                filter === 'pending' ? styles.active : ''
              }`}
              onClick={() => handleFilterChange('pending')}
            >
              Pending
            </button>
            <button
              className={`${styles.filterButton} ${
                filter === 'approved' ? styles.active : ''
              }`}
              onClick={() => handleFilterChange('approved')}
            >
              Approved
            </button>
            <button
              className={`${styles.filterButton} ${
                filter === 'declined' ? styles.active : ''
              }`}
              onClick={() => handleFilterChange('declined')}
            >
              Declined
            </button>
            <button
              className={`${styles.filterButton} ${
                filter === 'all' ? styles.active : ''
              }`}
              onClick={() => handleFilterChange('all')}
            >
              All
            </button>
          </div>
        </div>

        {showSort && (
          <div className={styles.sortGroup}>
            <label className={styles.groupLabel}>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="contest">Contest</option>
            </select>
          </div>
        )}
      </div>
    </section>
  );
};

export default ListControllers;
