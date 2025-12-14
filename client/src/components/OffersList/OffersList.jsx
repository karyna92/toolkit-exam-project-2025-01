import React, { useState, useRef } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import CONSTANTS from '../../constants';
import styles from './offersList.module.sass';

const offerStatusCommands = {
  approve: {
    title: 'Approve Offer',
    message: 'Are you sure you want to approve this offer?',
    action: (handleSetOfferStatus, offerId, userId) =>
      handleSetOfferStatus(offerId, userId, 'approve'),
    confirmLabel: 'Yes, Approve',
  },
  decline: {
    title: 'Decline Offer',
    message: 'Are you sure you want to decline this offer?',
    action: (handleSetOfferStatus, offerId, userId) =>
      handleSetOfferStatus(offerId, userId, 'decline'),
    confirmLabel: 'Yes, Decline',
  },
  reject: {
    title: 'Reject Offer',
    message: 'Are you sure you want to reject this offer?',
    action: (handleSetOfferStatus, offerId, userId) =>
      handleSetOfferStatus(offerId, userId, 'reject'),
    confirmLabel: 'Yes, Reject',
  },
  resolve: {
    title: 'Resolve Offer',
    message: 'Are you sure you want to resolve this offer as winner?',
    action: (handleSetOfferStatus, offerId, userId) =>
      handleSetOfferStatus(offerId, userId, 'resolve'),
    confirmLabel: 'Yes, Mark as Winner',
  },
};

const confirmStatusChange = (
  command,
  offerId,
  userId,
  handleSetOfferStatus
) => {
  const cmd = offerStatusCommands[command];
  if (!cmd) return;

  confirmAlert({
    title: cmd.title,
    message: cmd.message,
    buttons: [
      {
        label: cmd.confirmLabel,
        onClick: () => cmd.action(handleSetOfferStatus, offerId, userId),
      },
      { label: 'Cancel' },
    ],
  });
};

const OffersList = ({
  contestsWithOffers,
  offers,
  filter,
  loadingOffers,
  handleSetOfferStatus,
}) => {
  const [expandedContest, setExpandedContest] = useState(null);
  const expandedRefs = useRef({});

  const getFileUrl = (fileName) => {
    if (!fileName) return null;
    const fileUrl = `${CONSTANTS.FILE_BASE_URL}/${fileName}`;
    return fileUrl;
  };

  const scrollToExpandedRow = (contestId, offset = 350) => {
    requestAnimationFrame(() => {
      const element = expandedRefs.current[contestId];
      if (!element) return;
      const top = element.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: top - offset,
        behavior: 'smooth',
      });
    });
  };

  const toggleContestDetails = (contestId) => {
    setExpandedContest((prev) => {
      const isClosing = prev === contestId;
      const next = isClosing ? null : contestId;

      if (!isClosing) {
        scrollToExpandedRow(contestId);
      }

      return next;
    });
  };

  const approveOffer = (offerId, userId) => {
    confirmStatusChange('approve', offerId, userId, handleSetOfferStatus);
  };

  const declineOffer = (offerId, userId) => {
    confirmStatusChange('decline', offerId, userId, handleSetOfferStatus);
  };

  if (contestsWithOffers.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h3>No offers found</h3>
        <p>
          {filter === 'all'
            ? 'There are no offers available.'
            : `There are no ${filter} offers.`}
        </p>
      </div>
    );
  }

  return (
    <section className={styles.container}>
      <div className={styles.tableHeader}>
        <div className={styles.headerCell}>Contest Title</div>
        <div className={styles.headerCell}>Offers Count</div>
        <div
          className={`${styles.headerCell} ${styles.combinedColumn} ${styles.tableHeaderNested}`}
        >
          <div className={styles.headerCellNested}>Offer Details</div>
          <div className={styles.headerCellNested}>Files</div>
          <div className={styles.headerCellNested}>Actions</div>
        </div>
      </div>

      <div className={styles.tableBody}>
        {contestsWithOffers.map((contest, contestIndex) => {
          const contestOffers = offers.filter(
            (offer) => offer.contestId === contest.id
          );
          const isExpanded = expandedContest === contest.id;

          return (
            <React.Fragment key={`c-${contest.id}-${contestIndex}`}>
              <div className={styles.tableRow}>
                <div className={`${styles.mobileHeader} ${styles.tableCell}`}>
                  Contest Title
                </div>
                <div className={styles.tableCell}>
                  <p className={styles.contestTitle}>{contest.title}</p>
                  <button
                    className={styles.contestNameButton}
                    onClick={() => toggleContestDetails(contest.id)}
                  >
                    <span>view details </span>
                    <span className={styles.expandIcon}>
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </button>
                </div>
                <div className={`${styles.mobileHeader} ${styles.tableCell}`}>
                  count
                </div>
                <div className={styles.tableCell}>
                  <span className={styles.count}>
                    {contestOffers.length || 0}
                  </span>
                </div>
                <div className={`${styles.combinedColumn} ${styles.tableCell}`}>
                  {contestOffers.length > 0 ? (
                    <div className={styles.offersGrid}>
                      {contestOffers.map((offer, offerIndex) => (
                        <div
                          key={`offer-grid-${offer.id}-${offerIndex}`}
                          className={styles.offerRow}
                        >
                          <div
                            className={`${styles.tableCellNested} ${styles.offerDetail}`}
                          >
                            <div className={styles.mobileHeader}>
                              Offer Details
                            </div>
                            <span className={styles.offerText}>
                              {offer.text || 'No description'}
                            </span>
                            {offer.status && (
                              <span
                                className={`${styles.offerStatus} ${
                                  styles[offer.status]
                                }`}
                              >
                                {offer.status}
                              </span>
                            )}
                          </div>
                          <div
                            className={`${styles.tableCellNested} ${styles.offerFile}`}
                          >
                            <div className={styles.mobileHeader}>Files</div>
                            {offer.fileName ? (
                              <a
                                href={getFileUrl(offer.fileName)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.fileButton}
                                title={`Download ${offer.fileName}`}
                              >
                                📎 {offer.fileName}
                              </a>
                            ) : (
                              <span className={styles.noFiles}>No file</span>
                            )}
                          </div>
                          <div className={styles.tableCellNested}>
                            <div className={styles.mobileHeader}>Actions</div>
                            <div className={styles.offerAction}>
                              <button
                                className={styles.approveButton}
                                onClick={() =>
                                  approveOffer(offer.id, offer.userId)
                                }
                                disabled={
                                  offer.status !==
                                    CONSTANTS.OFFER_STATUS_PENDING ||
                                  loadingOffers[offer.id]
                                }
                              >
                                {loadingOffers[offer.id] ? '...' : '✓'}
                              </button>
                              <button
                                className={styles.declineButton}
                                onClick={() =>
                                  declineOffer(offer.id, offer.userId)
                                }
                                disabled={
                                  offer.status !==
                                    CONSTANTS.OFFER_STATUS_PENDING ||
                                  loadingOffers[offer.id]
                                }
                              >
                                {loadingOffers[offer.id] ? '...' : '✕'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.noOffersMessage}>No offers yet</div>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div
                  className={styles.expandedRow}
                  ref={(el) => (expandedRefs.current[contest.id] = el)}
                >
                  <div className={styles.contestDetails}>
                    <h4>Contest Details</h4>
                    <div className={styles.detailsGrid}>
                      <p>
                        <strong>Contest Type:</strong>{' '}
                        {contest.contestType || 'N/A'}
                      </p>
                      <p>
                        <strong>Industry:</strong> {contest.industry || 'N/A'}
                      </p>
                      <p>
                        <strong>Focus of Work:</strong>{' '}
                        {contest.focusOfWork || 'N/A'}
                      </p>
                      <p>
                        <strong>Target Customer:</strong>{' '}
                        {contest.targetCustomer || 'N/A'}
                      </p>
                      {contest.typeOfName && (
                        <p>
                          <strong>Type of Name: </strong>
                          {contest.typeOfName}
                        </p>
                      )}
                      {contest.styleName && (
                        <p>
                          <strong>Name Style:</strong>
                          {contest.styleName}
                        </p>
                      )}
                      {contest.nameVenture && (
                        <p>
                          <strong>Name Venture:</strong>
                          {contest.nameVenture}
                        </p>
                      )}
                      {contest.typeOfTagline && (
                        <p>
                          <strong>Tagline Type:</strong>
                          {contest.typeOfTagline}
                        </p>
                      )}
                      {contest.brandStyle && (
                        <p>
                          <strong>Brand Style:</strong>
                          {contest.brandStyle}
                        </p>
                      )}
                      <p>
                        <strong>Prize:</strong> ${contest.prize || 'N/A'}
                      </p>
                    </div>

                    {(contest.fileName || contest.file) && (
                      <div className={styles.filesSection}>
                        <h5>Contest Files</h5>
                        <div className={styles.filesList}>
                          <div className={styles.fileItem}>
                            <a
                              href={getFileUrl(contest.fileName)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.fileLink}
                              title={`Download ${contest.fileName}`}
                            >
                              📎 {contest.fileName}
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
};

export default OffersList;
