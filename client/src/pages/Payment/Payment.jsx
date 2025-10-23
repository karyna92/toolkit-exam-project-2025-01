import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import isEmpty from 'lodash/isEmpty';
import {
  pay as payAction,
  clearPaymentStore,
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
  const { error } = payment;

  useEffect(() => {
    if (isEmpty(contests)) {
      navigate('/startContest', { replace: true });
    }
  }, [contests, navigate]);

  const pay = (values) => {
    const contestArray = Object.keys(contests).map((key) => ({
      ...contests[key],
    }));
    const { number, expiry, cvc } = values;

    const data = new FormData();
    contestArray.forEach((contest) => {
      data.append('files', contest.file);
      contest.haveFile = !!contest.file;
    });

    data.append('number', number);
    data.append('expiry', expiry);
    data.append('cvc', cvc);
    data.append('contests', JSON.stringify(contestArray));
    data.append('price', '100');

    dispatch(payAction({ data: { formData: data }, navigate }));
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.paymentContainer}>
        <span className={styles.headerLabel}>Checkout</span>
        {error && (
          <Error
            data={error.data}
            status={error.status}
            clearError={() => dispatch(clearPaymentStore())}
          />
        )}
        <PayForm sendRequest={pay} back={goBack} isPayForOrder />
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
        <a href="http://www.google.com">Have a promo code?</a>
      </div>
    </div>
  );
};

export default Payment;
