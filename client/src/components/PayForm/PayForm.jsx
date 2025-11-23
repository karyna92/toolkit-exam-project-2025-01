import React from 'react';
import Cards from 'react-credit-cards-2';
import { Form, Formik } from 'formik';
import { useDispatch } from 'react-redux';
import { changeFocusOnCard } from '../../store/slices/paymentSlice';
import PayInput from '../InputComponents/PayInput/PayInput';
import Schems from '../../utils/validators/validationSchems';
import styles from './PayForm.module.sass';
import 'react-credit-cards-2/dist/es/styles-compiled.css';

const PayForm = ({
  focusOnElement,
  isPayForOrder,
  sendRequest,
  back,
  isSubmitting,
}) => {
  const dispatch = useDispatch();

  const handleFocusChange = (name) => {
    dispatch(changeFocusOnCard(name));
  };

  const handlePay = (values, { setSubmitting }) => {
    sendRequest(values);
    setSubmitting(false);
  };

  return (
    <div className={styles.payFormContainer}>
      <span className={styles.headerInfo}>Payment Information</span>

      <Formik
        initialValues={{
          focusOnElement: '',
          name: '',
          number: '',
          cvc: '',
          expiry: '',
          sum: '',
        }}
        onSubmit={handlePay}
        validationSchema={Schems.PaymentSchema}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {({ values, errors, touched, isValid, dirty }) => {
          const { name, number, expiry, cvc, sum } = values;

          return (
            <>
              <div className={styles.cardContainer}>
                <Cards
                  number={number || ''}
                  name={name || ''}
                  expiry={expiry || ''}
                  cvc={cvc || ''}
                  focused={focusOnElement}
                />
              </div>

              <Form id="myForm" className={styles.formContainer}>
                <div className={styles.bigInput}>
                  <span>Cardholder Name</span>
                  <PayInput
                    name="name"
                    type="text"
                    label="Cardholder Name"
                    changeFocus={handleFocusChange}
                    classes={{
                      container: styles.inputContainer,
                      input: styles.input,
                      notValid: styles.notValid,
                      error: styles.error,
                    }}
                  />
                  {touched.name && errors.name && (
                    <div className={styles.fieldError}>{errors.name}</div>
                  )}
                </div>

                {!isPayForOrder && (
                  <div className={styles.bigInput}>
                    <span>Sum</span>
                    <PayInput
                      name="sum"
                      type="text"
                      label="Sum"
                      classes={{
                        container: styles.inputContainer,
                        input: styles.input,
                        notValid: styles.notValid,
                        error: styles.error,
                      }}
                    />
                  </div>
                )}

                <div className={styles.bigInput}>
                  <span>Card Number</span>
                  <PayInput
                    isInputMask
                    maskType="cardNumber"
                    name="number"
                    type="text"
                    label="Card Number"
                    changeFocus={handleFocusChange}
                    classes={{
                      container: styles.inputContainer,
                      input: styles.input,
                      notValid: styles.notValid,
                      error: styles.error,
                    }}
                  />
                  {touched.number && errors.number && (
                    <div className={styles.fieldError}>{errors.number}</div>
                  )}
                </div>

                <div className={styles.smallInputContainer}>
                  <div className={styles.smallInput}>
                    <span>* Expires</span>
                    <PayInput
                      isInputMask
                      maskType="expiry"
                      name="expiry"
                      type="text"
                      label="Expiry"
                      changeFocus={handleFocusChange}
                      classes={{
                        container: styles.inputContainer,
                        input: styles.input,
                        notValid: styles.notValid,
                        error: styles.error,
                      }}
                    />
                    {touched.expiry && errors.expiry && (
                      <div className={styles.fieldError}>{errors.expiry}</div>
                    )}
                  </div>

                  <div className={styles.smallInput}>
                    <span>* Security Code</span>
                    <PayInput
                      isInputMask
                      maskType="cvc"
                      name="cvc"
                      type="text"
                      label="CVC"
                      changeFocus={handleFocusChange}
                      classes={{
                        container: styles.inputContainer,
                        input: styles.input,
                        notValid: styles.notValid,
                        error: styles.error,
                      }}
                    />
                    {touched.cvc && errors.cvc && (
                      <div className={styles.fieldError}>{errors.cvc}</div>
                    )}
                  </div>
                </div>
              </Form>
            </>
          );
        }}
      </Formik>

      {isPayForOrder && (
        <div className={styles.totalSum}>
          <span>Total: $100.00</span>
        </div>
      )}

      <div className={styles.buttonsContainer}>
        <button
          form="myForm"
          className={styles.payButton}
          type="submit"
          disabled={isSubmitting}
        >
          <span>
            {isSubmitting
              ? 'Processing...'
              : isPayForOrder
              ? 'Pay Now'
              : 'Cash Out'}
          </span>
        </button>

        {isPayForOrder && (
          <div onClick={back} className={styles.backButton}>
            <span>Back</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayForm;
