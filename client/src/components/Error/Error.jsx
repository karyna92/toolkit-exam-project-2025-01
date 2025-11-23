import React from 'react';
import styles from './Error.module.sass';

const Error = (props) => {
  const { status, data, clearError } = props;

  const getMessage = () => {
    if (!data) {
      return 'An unexpected error occurred. Please try again.';
    }

    if (data.userMessage) {
      return data.userMessage;
    }

    if (data.message) {
      return data.message;
    }

    if (data.code) {
      switch (data.code) {
        case 'invalid_card_details':
          return 'The card details you entered are not valid. Please check your card information.';
        case 'insufficient_funds':
          return (
            data.userMessage ||
            `Your card has insufficient funds. Available balance: $${data.balance}. Required: $${data.required}.`
          );
        case 'missing_fields':
          return 'Please fill in all required payment information.';
        case 'invalid_name':
          return 'Please enter a valid cardholder name.';
        case 'validation_error':
          return 'Invalid contest data provided. Please check your contest information.';
        case 'bank_decline':
          return 'Your card was declined. Please check your card details or try a different payment method.';
        case 'payment_processing_error':
          return 'Unable to process payment. Please try again.';

        case 'not_unique_email':
          return 'This email is already registered. Please use a different email or log in.';
        case 'rights_error':
          return 'You do not have permission to perform this action.';
        case 'token_error':
          return 'Your session has expired. Please log in again.';
        case 'uncorrect_password':
          return 'The password you entered is incorrect. Please try again.';
        case 'authentication_error':
          return 'Authentication failed. Please log in to continue.';

        case 'database_connection_error':
          return 'Unable to connect to database. Please try again.';
        case 'foreign_key_violation':
          return 'Invalid reference. Please check your data.';
        case 'check_constraint_violation':
          return 'Invalid data provided. Please check your input.';
        case 'unique_constraint_violation':
          return 'This record already exists.';
        case 'invalid_json':
          return 'Invalid data format provided.';

        case 'network_error':
          return 'Unable to connect to payment service. Please check your internet connection.';
        case 'critical_error':
          return 'A critical error occurred. Please try again later.';

        case 'bad_request':
          return 'Invalid request. Please check your input.';
        case 'not_found':
          return 'The requested resource was not found.';
        case 'application_error':
          return 'An application error occurred. Please try again.';

        default:
          return 'An unexpected error occurred. Please try again.';
      }
    }

    switch (status) {
      case 400:
        return 'Please check your payment information and try again.';
      case 401:
        return 'Your session has expired. Please log in again.';
      case 402:
        return 'Your card was declined. Please check your card details or try a different payment method.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 406:
        return 'Invalid data provided. Please check your input.';
      case 409:
        return 'This record already exists.';
      case 500:
        return 'Server error occurred. Please try again later.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again in a few moments.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  const getErrorType = () => {
    if (!status) return 'serverError';

    if (
      status === 401 ||
      status === 403 ||
      (data &&
        (data.code === 'token_error' ||
          data.code === 'rights_error' ||
          data.code === 'authentication_error'))
    ) {
      return 'authError';
    }

    if (
      status === 402 ||
      (data &&
        data.code &&
        (data.code.includes('bank') ||
          data.code.includes('card') ||
          data.code.includes('payment') ||
          data.code.includes('funds')))
    ) {
      return 'bankError';
    }

    if (status >= 400 && status < 500) {
      return 'clientError';
    }

    return 'serverError';
  };

  const message = getMessage();
  const errorType = getErrorType();

  const getErrorHeader = () => {
    switch (errorType) {
      case 'bankError':
        return 'Payment Failed';
      case 'authError':
        return 'Authentication Required';
      case 'clientError':
        return 'Please Check Your Information';
      case 'serverError':
        return 'System Error';
      default:
        return 'Error';
    }
  };

  return (
    <div className={`${styles.errorContainer} ${styles[errorType]}`}>
      <div className={styles.errorContent}>
        <div className={styles.errorHeader}>{getErrorHeader()}</div>
        <span className={styles.errorMessage}>{message}</span>
        <button
          className={styles.closeButton}
          onClick={clearError}
          aria-label="Close error"
        >
          <i className="far fa-times-circle" />
          <span className={styles.closeText}>Dismiss</span>
        </button>
      </div>
    </div>
  );
};

export default Error;
