import React, { useEffect, useCallback, useState } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import classNames from 'classnames';
import {
  getContests,
  clearContestsList,
  setNewCustomerFilter,
} from '../../store/slices/contestsSlice';
import ContestsContainer from '../ContestsContainer/ContestsContainer';
import ContestBox from '../ContestBox/ContestBox';
import TryAgain from '../TryAgain/TryAgain';
import Pagination from '../Pagination/Pagination';
import CONSTANTS from '../../constants';
import styles from './CustomerDashboard.module.sass';

const CustomerDashboard = ({ navigate }) => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);

  const { contests, customerFilter, error, isFetching, haveMore, totalCount } =
    useSelector(
      (state) => ({
        contests: state.contestsList.contests,
        customerFilter: state.contestsList.customerFilter,
        error: state.contestsList.error,
        isFetching: state.contestsList.isFetching,
        haveMore: state.contestsList.haveMore,
        totalCount: state.contestsList.totalCount,
      }),
      shallowEqual
    );

  const getContestsData = useCallback(
    (page = 1) => {
      const limit = 5;
      const offset = (page - 1) * limit;

      dispatch(clearContestsList());

      dispatch(
        getContests({
          requestData: {
            limit,
            offset,
            status: customerFilter, 
          },
          role: CONSTANTS.CUSTOMER,
        })
      );
    },
    [dispatch, customerFilter]
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    getContestsData(page);
  };

  const goToExtended = (contest_id) => navigate(`/contest/${contest_id}`);

  const tryToGetContest = () => {
    setCurrentPage(1);
    getContestsData(1);
  };

  const handleFilterChange = (filter) => {
    dispatch(setNewCustomerFilter(filter));
    setCurrentPage(1);
    getContestsData(1);
  };

  useEffect(() => {
    getContestsData(1);
  }, [dispatch, customerFilter]);

  const renderContests = () =>
    contests.map((contest, i) => (
      <ContestBox
        data={contest}
        key={`${contest.id}-${i}`}
        goToExtended={goToExtended}
      />
    ));

  const totalPages = totalCount ? Math.ceil(totalCount / 5) : 1;

  return (
    <div className={styles.mainContainer}>
      <div className={styles.filterContainer}>
        {[
          { label: 'Active Contests', value: CONSTANTS.CONTEST_STATUS_ACTIVE },
          {
            label: 'Completed contests',
            value: CONSTANTS.CONTEST_STATUS_FINISHED,
          },
          {
            label: 'Inactive contests',
            value: CONSTANTS.CONTEST_STATUS_PENDING,
          },
        ].map((filter) => (
          <div
            key={filter.value}
            onClick={() => handleFilterChange(filter.value)}
            className={classNames({
              [styles.activeFilter]: filter.value === customerFilter,
              [styles.filter]: filter.value !== customerFilter,
            })}
          >
            {filter.label}
          </div>
        ))}
      </div>

      <div className={styles.contestsContainer}>
        {error ? (
          <TryAgain getData={tryToGetContest} />
        ) : (
          <div className={styles.paginatedWrapper}>
            <ContestsContainer
              isFetching={isFetching}
              haveMore={false}
              loadMore={() => {}}
            >
              {renderContests()}
            </ContestsContainer>

            {totalPages > 1 && (
              <div className={styles.paginationSection}>
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
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
