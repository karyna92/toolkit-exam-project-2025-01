const { MongooseError } = require('mongoose');
const { ApplicationError } = require('../errors');

const mapErrorToResponse = (err) => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof MongooseError.ValidationError) {
    statusCode = 400;
    message = err.message;
  } else if (err instanceof MongooseError.CastError) {
    statusCode = 400;
    message = 'Invalid ID';
  } else if (err.code) {
    if (err.code === '23514') {
      statusCode = 406;
      message = err.detail || 'Check constraint violation';
    } else if (err.code === '23505') {
      statusCode = 409;
      message = err.detail || 'Unique constraint violation';
    }
  } else if (err instanceof ApplicationError) {
    statusCode = err.code || 400;
    message = err.message;
  }

  return { statusCode, message };
};

module.exports = mapErrorToResponse;
