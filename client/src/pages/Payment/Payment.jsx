import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import isEmpty from 'lodash/isEmpty';
import {
  pay as payAction,
  clearPaymentError,
} from '../../store/slices/paymentSlice';
import PayForm from '../../components/PayForm/PayForm';
import Error from '../../components/Error/Error';
import styles from './Payment.module.sass';

const Payment = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const payment = useSelector((state) => state.payment);
  const contestCreationStore = useSelector(
    (state) => state.contestCreationStore
  );
  const { contests } = contestCreationStore;
  const { error, isFetching } = payment;

  useEffect(() => {
    if (isEmpty(contests)) {
      navigate('/startContest', { replace: true });
    }
  }, [contests, navigate]);

  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearPaymentError());
      }
    };
  }, [dispatch, error]);

  const pay = (values) => {
    dispatch(clearPaymentError());

    const contestArray = Object.keys(contests).map((key) => ({
      ...contests[key],
    }));

    const { number, expiry, cvc, name } = values;

    const data = new FormData();

    contestArray.forEach((contest) => {
      if (contest.file) {
        data.append('files', contest.file);
      }
      contest.haveFile = !!contest.file;
    });

    data.append('name', name || '');
    data.append('number', number || '');
    data.append('expiry', expiry || '');
    data.append('cvc', cvc || '');
    data.append('contests', JSON.stringify(contestArray));
    data.append('price', '100');

    dispatch(payAction({ data: { formData: data }, navigate }));
  };

  const goBack = () => {
    if (error) {
      dispatch(clearPaymentError());
    }
    navigate(-1);
  };

  if (isEmpty(contests)) {
    return (
      <div className={styles.loadingContainer}>
        <span>Redirecting to contests...</span>
      </div>
    );
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.paymentContainer}>
        <span className={styles.headerLabel}>Checkout</span>

        {error && (
          <Error
            data={error.data}
            status={error.status}
            clearError={() => dispatch(clearPaymentError())}
          />
        )}

        <PayForm
          sendRequest={pay}
          back={goBack}
          isPayForOrder
          isSubmitting={isFetching}
        />
      </div>

      <div className={styles.orderInfoContainer}>
        <span className={styles.orderHeader}>Order Summary</span>
        <div className={styles.packageInfoContainer}>
          <span className={styles.packageName}>Package Name: Standard</span>
          <span className={styles.packagePrice}>$100 USD</span>
        </div>
        <div className={styles.resultPriceContainer}>
          <span>Total:</span>
          <span>$100.00 USD</span>
        </div>
        <a href="http://www.google.com" onClick={(e) => e.preventDefault()}>
          Have a promo code?
        </a>
      </div>
    </div>
  );
};

export default Payment;
