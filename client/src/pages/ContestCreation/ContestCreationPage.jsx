import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { saveContestToStore } from '../../store/slices/contestCreationSlice';
import NextButton from '../../components/NextButton/NextButton';
import ContestForm from '../../components/ContestForm/ContestForm';
import BackButton from '../../components/BackButton/BackButton';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import styles from './ContestCreationPage.module.sass';

const ContestCreationPage = ({ contestType, title }) => {
  const formRef = useRef();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const contests = useSelector((state) => state.contestCreationStore.contests);
  const bundle = useSelector((state) => state.bundleStore.bundle);

  const contestData = contests[contestType] || {
    contestType,
  };

  const handleSubmit = (values) => {
    dispatch(saveContestToStore({ type: contestType, info: values }));

    const route =
      bundle[contestType] === 'payment'
        ? '/payment'
        : `/startContest/${bundle[contestType]}Contest`;

    navigate(route);
  };

  const submitForm = () => {
    formRef.current?.handleSubmit();
  };

  useEffect(() => {
    if (!bundle) {
      navigate('/startContest', { replace: true });
    }
  }, [bundle, navigate]);

  return (
    <div>
      <div className={styles.startContestHeader}>
        <div className={styles.startContestInfo}>
          <h2>{title}</h2>
          <span>
            Tell us a bit more about your business as well as your preferences
            so that creatives get a better idea about what you are looking for
          </span>
        </div>
        <ProgressBar currentStep={2} />
      </div>
      <div className={styles.container}>
        <ContestForm
          contestType={contestType}
          handleSubmit={handleSubmit}
          formRef={formRef}
          defaultData={contestData}
        />
      </div>
      <div className={styles.footerButtonsContainer}>
        <div className={styles.lastContainer}>
          <div className={styles.buttonsContainer}>
            <BackButton />
            <NextButton submit={submitForm} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestCreationPage;
