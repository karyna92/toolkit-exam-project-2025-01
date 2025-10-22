import React from 'react';
import styles from './Pagination.module.sass';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
  middlePagesCount = 3,
}) => {
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  const generatePageNumbers = () => {
    const pages = [];

    pages.push(1);
    if (totalPages > 1) pages.push(2);

    const middleStart = Math.max(
      3,
      currentPage - Math.floor(middlePagesCount / 2)
    );
    const middleEnd = Math.min(
      totalPages - 2,
      currentPage + Math.floor(middlePagesCount / 2)
    );

    if (middleStart > 3) {
      pages.push('ellipsis-start');
    }

    for (let i = middleStart; i <= middleEnd; i++) {
      if (i > 2 && i < totalPages - 1) {
        pages.push(i);
      }
    }

    if (middleEnd < totalPages - 2) {
      pages.push('ellipsis-end');
    }

    if (totalPages > 3) pages.push(totalPages - 1);
    if (totalPages > 2) pages.push(totalPages);

    return [...new Set(pages)];
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className={styles.paginationContainer}>
      <button
        className={`${styles.navButton} ${styles.prevButton} ${
          currentPage === 1 ? styles.disabled : ''
        }`}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ← Previous
      </button>

      {showPageNumbers && (
        <div className={styles.pageNumbers}>
          {pageNumbers.map((page, index) => {
            if (page === 'ellipsis-start' || page === 'ellipsis-end') {
              return (
                <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                  . . .
                </span>
              );
            }

            return (
              <button
                key={page}
                className={`${styles.pageButton} ${
                  currentPage === page ? styles.active : ''
                }`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            );
          })}
        </div>
      )}

      <button
        className={`${styles.navButton} ${styles.nextButton} ${
          currentPage === totalPages ? styles.disabled : ''
        }`}
        onClick={() =>
          currentPage < totalPages && onPageChange(currentPage + 1)
        }
        disabled={currentPage === totalPages}
      >
        Next →
      </button>
    </div>
  );
};

export default Pagination;
