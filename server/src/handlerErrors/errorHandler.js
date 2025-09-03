const mapErrorToResponse = require('./mapErrorToResponse');

const errorHandler = (err, req, res, next) => {
  try {
    console.error(err);

    const { statusCode, message } = mapErrorToResponse(err);

    if (!res.headersSent) {
      return res.status(statusCode).json({ error: message });
    }
    console.error('Cannot send response, headers already sent');
  } catch (handlerError) {
    console.error('Error handler failed:', handlerError);
    if (res && !res.headersSent) {
      res.status(500).json({ error: 'Critical server error' });
    }
  }
};

module.exports = errorHandler;
