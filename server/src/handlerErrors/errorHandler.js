const mapErrorToResponse = require('./mapErrorToResponse');
const logError = require('../services/errorLogger');

const errorHandler = (err, req, res, next) => {
  try {
    logError(err, err.statusCode || 500);

    const { statusCode, message, userMessage, code, ...additionalData } =
      mapErrorToResponse(err);

    if (!res.headersSent) {
      return res.status(statusCode).json({
        success: false,
        error: {
          code,
          message,
          userMessage,
          ...additionalData,
        },
      });
    }
  } catch (handlerError) {
    logError(handlerError, 500);

    if (res && !res.headersSent) {
      res.status(500).json({
        success: false,
        error: {
          code: 'critical_error',
          message: 'Critical server error',
          userMessage: 'A critical error occurred. Please try again later.',
        },
      });
    }
  }
};

module.exports = errorHandler;
