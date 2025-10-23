import React from 'react';
import moment from 'moment';
import CONSTANTS from '../../constants';
import styles from './ContestSideBar.module.sass';

const ContestSideBar = (props) => {

  const getTimeStr = () => {
    if (!props.data || !props.data.createdAt) {
      return 'just now';
    }

    const now = moment();
    const createdAt = moment.utc(props.data.createdAt).local();
    const diffMinutes = now.diff(createdAt, 'minutes');
    const diffHours = now.diff(createdAt, 'hours');

    if (diffMinutes < 1) {
      return 'just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else {
      const days = Math.floor(diffHours / 24);
      return `${days}d`;
    }
  };

  const renderContestInfo = () => {
    if (!props.contestData) {
      return <div className={styles.notFound}>Contest data not available</div>;
    }

    const { totalEntries } = props;
    const { User, prize } = props.contestData;

    return (
      <div className={styles.contestSideBarInfo}>
        <div className={styles.contestInfo}>
          <div className={styles.awardAndTimeContainer}>
            <div className={styles.prizeContainer}>
              <img
                src={`${CONSTANTS.STATIC_IMAGES_PATH}big-diamond.png`}
                alt="diamond"
              />
              <span>{`$ ${prize}`}</span>
            </div>
            <div className={styles.timeContainer}>
              <div className={styles.timeDesc}>
                <img
                  src={`${CONSTANTS.STATIC_IMAGES_PATH}clock.png`}
                  alt="clock"
                />
                <span>Going</span>
              </div>
              <span className={styles.time}>{getTimeStr()}</span>
            </div>
            <div className={styles.guaranteedPrize}>
              <div>
                <img
                  src={`${CONSTANTS.STATIC_IMAGES_PATH}smallCheck.png`}
                  alt="check"
                />
              </div>
              <span>Guaranteed prize</span>
            </div>
          </div>
          <div className={styles.contestStats}>
            <span>Contest Stats</span>
            <div className={styles.totalEntrie}>
              <span className={styles.totalEntriesLabel}>Total Entries</span>
              <span>{totalEntries}</span>
            </div>
          </div>
        </div>
        {props.data && props.data.id !== User.id && (
          <div className={styles.infoCustomerContainer}>
            <span className={styles.labelCustomerInfo}>
              About Contest Holder
            </span>
            <div className={styles.customerInfo}>
              <img
                src={
                  User.avatar === 'anon.png'
                    ? CONSTANTS.ANONYM_IMAGE_PATH
                    : `${CONSTANTS.publicURL}${User.avatar}`
                }
                alt="user"
              />
              <div className={styles.customerNameContainer}>
                <span>{`${User.firstName} ${User.lastName}`}</span>
                <span>{User.displayName}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return renderContestInfo();
};

export default ContestSideBar;