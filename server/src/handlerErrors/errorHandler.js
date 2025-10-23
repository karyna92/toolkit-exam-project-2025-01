const mapErrorToResponse = require('./mapErrorToResponse');
const logError = require('../services/errorLogger');

const errorHandler = (err, req, res, next) => {
  try {
    console.error(err);

    const { statusCode, message } = mapErrorToResponse(err);
    logError(err, statusCode);

    if (!res.headersSent) {
      return res.status(statusCode).json({ error: message });
    }
    console.error('Cannot send response, headers already sent');
  } catch (handlerError) {
    console.error('Error handler failed:', handlerError);
    logError(handlerError, 500);
    if (res && !res.headersSent) {
      res.status(500).json({ error: 'Critical server error' });
    }
  }
};

module.exports = errorHandler;
