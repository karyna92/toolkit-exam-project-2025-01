import React, { useEffect, useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import queryString from 'query-string';
import classNames from 'classnames';
import isEqual from 'lodash/isEqual';
import {
  getContests,
  clearContestsList,
  setNewCreatorFilter,
} from '../../store/slices/contestsSlice';
import { getDataForContest } from '../../store/slices/dataForContestSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import ContestsContainer from '../ContestsContainer/ContestsContainer';
import ContestBox from '../ContestBox/ContestBox';
import TryAgain from '../TryAgain/TryAgain';
import Pagination from '../Pagination/Pagination';
import CONSTANTS from '../../constants';
import styles from './CreatorDashboard.module.sass';

const types = [
  '',
  'name,tagline,logo',
  'name',
  'tagline',
  'logo',
  'name,tagline',
  'logo,tagline',
  'name,logo',
];

const CreatorDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [isInitialized, setIsInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const contests = useSelector((state) => state.contestsList.contests);
  const creatorFilter = useSelector(
    (state) => state.contestsList.creatorFilter
  );
  const error = useSelector((state) => state.contestsList.error);
  const totalCount = useSelector((state) => state.contestsList.totalCount);
  const isFetching = useSelector((state) => state.contestsList.isFetching);
  const dataForContest = useSelector((state) => state.dataForContest.data);

  const getContestsData = useCallback(
    (filter, page = 1) => {
      const limit = 5;
      const offset = (page - 1) * limit;

      dispatch(clearContestsList());
      dispatch(
        getContests({
          requestData: { limit, offset, ...filter },
          role: CONSTANTS.CREATOR,
        })
      );
    },
    [dispatch]
  );

  const parseUrlForParams = useCallback(
    (search) => {
      const obj = queryString.parse(search);
      const filter = {
        typeIndex: obj.typeIndex ? parseInt(obj.typeIndex) : 1,
        contestId: obj.contestId || '',
        industry: obj.industry || '',
        awardSort: obj.awardSort || 'asc',
        ownEntries: obj.ownEntries === 'true',
      };

      if (!isEqual(filter, creatorFilter)) {
        dispatch(setNewCreatorFilter(filter));
        setCurrentPage(1);
        getContestsData(filter, 1);
        return false;
      }
      return true;
    },
    [creatorFilter, dispatch, getContestsData]
  );

  const parseParamsToUrl = useCallback(
    (filter) => {
      const obj = {};
      Object.keys(filter).forEach((key) => {
        if (filter[key]) obj[key] = filter[key];
      });
      navigate(`/Dashboard?${queryString.stringify(obj)}`, { replace: true });
    },
    [navigate]
  );

  const changePredicate = useCallback(
    ({ name, value }) => {
      const updatedValue = value === 'Choose industry' ? null : value;
      const updatedFilter = { ...creatorFilter, [name]: updatedValue };
      dispatch(setNewCreatorFilter(updatedFilter));
      parseParamsToUrl(updatedFilter);
      setCurrentPage(1);
      getContestsData(updatedFilter, 1);
    },
    [creatorFilter, dispatch, parseParamsToUrl, getContestsData]
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    getContestsData(creatorFilter, page);
  };

  const tryLoadAgain = useCallback(() => {
    setCurrentPage(1);
    getContestsData(creatorFilter, 1);
  }, [getContestsData, creatorFilter]);

  const renderContests = useCallback(
    () =>
      contests.map((contest) => (
        <ContestBox
          data={contest}
          key={contest.id}
          goToExtended={(id) => navigate(`/contest/${id}`)}
        />
      )),
    [contests, navigate]
  );

  const renderSelectType = () => (
    <select
      className={styles.input}
      value={types[creatorFilter.typeIndex] || types[1]}
      onChange={({ target }) =>
        changePredicate({
          name: 'typeIndex',
          value: types.indexOf(target.value),
        })
      }
    >
      {types.slice(1).map((type, i) => (
        <option key={i} value={type}>
          {type}
        </option>
      ))}
    </select>
  );

  const renderIndustryType = () => {
    const industryOptions = dataForContest?.industry || [];
    return (
      <select
        className={styles.input}
        value={creatorFilter.industry || ''}
        onChange={({ target }) =>
          changePredicate({ name: 'industry', value: target.value })
        }
      >
        <option value="">Choose industry</option>
        {industryOptions.map((ind, i) => (
          <option key={i} value={ind}>
            {ind}
          </option>
        ))}
      </select>
    );
  };

  useEffect(() => {
    dispatch(getDataForContest());
  }, [dispatch]);

  useEffect(() => {
    if (!isInitialized) {
      const searchParams = queryString.parse(location.search);
      if (Object.keys(searchParams).length === 0) {
        const defaultFilter = {
          typeIndex: 1,
          contestId: '',
          industry: '',
          awardSort: 'asc',
          ownEntries: false,
        };
        dispatch(setNewCreatorFilter(defaultFilter));
        getContestsData(defaultFilter, 1);
      } else {
        parseUrlForParams(location.search);
      }
      setIsInitialized(true);
    }
  }, [location.search, isInitialized]);

  const totalPages = totalCount ? Math.ceil(totalCount / 5) : 1;

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.filterContainer}>
        <span className={styles.headerFilter}>Filter Results</span>
        <div className={styles.inputsContainer}>
          <div
            onClick={() =>
              changePredicate({
                name: 'ownEntries',
                value: !creatorFilter.ownEntries,
              })
            }
            className={classNames(styles.myEntries, {
              [styles.activeMyEntries]: creatorFilter.ownEntries,
            })}
          >
            My Entries
          </div>
          <div className={styles.inputContainer}>
            <span>By contest type</span>
            {renderSelectType()}
          </div>
          <div className={styles.inputContainer}>
            <span>By contest ID</span>
            <input
              type="text"
              name="contestId"
              value={creatorFilter.contestId || ''}
              className={styles.input}
              onChange={({ target }) =>
                changePredicate({ name: 'contestId', value: target.value })
              }
            />
          </div>
          <div className={styles.inputContainer}>
            <span>By industry</span>
            {renderIndustryType()}
          </div>
          <div className={styles.inputContainer}>
            <span>By amount award</span>
            <select
              className={styles.input}
              value={creatorFilter.awardSort || 'asc'}
              onChange={({ target }) =>
                changePredicate({ name: 'awardSort', value: target.value })
              }
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {error ? (
        <div className={styles.messageContainer}>
          <TryAgain getData={tryLoadAgain} />
        </div>
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
  );
};

export default CreatorDashboard;
