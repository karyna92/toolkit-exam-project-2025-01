const { MongooseError } = require('mongoose');
const {
  ApplicationError,
  BadRequestError,
  ValidationError,
  NotFoundError,
  InsufficientFundsError,
  BankDeclineError,
  InvalidCardError,
  NotUniqueEmail,
  RightsError,
  TokenError,
  UncorrectPassword,
} = require('../errors');

const mapErrorToResponse = (err) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let userMessage = 'An unexpected error occurred. Please try again later.';
  let code = 'internal_error';

  if (err instanceof MongooseError.ValidationError) {
    statusCode = 400;
    message = err.message;
    userMessage = 'Invalid data provided. Please check your information.';
    code = 'validation_error';
  } else if (err instanceof MongooseError.CastError) {
    statusCode = 400;
    message = 'Invalid ID';
    userMessage = 'The provided ID is not valid.';
    code = 'invalid_id';
  } else if (err.code) {
    if (err.code === '23514') {
      statusCode = 406;
      message = err.detail || 'Check constraint violation';
      userMessage = 'Invalid data provided. Please check your input.';
      code = 'check_constraint_violation';
    } else if (err.code === '23505') {
      statusCode = 409;
      message = err.detail || 'Unique constraint violation';
      userMessage = 'This record already exists.';
      code = 'unique_constraint_violation';
    }
  } else if (err instanceof ApplicationError) {
    statusCode = err.status || 400;
    message = err.message;
    userMessage = err.userMessage || err.message;

    if (err instanceof BadRequestError) code = 'bad_request';
    else if (err instanceof ValidationError) code = 'validation_error';
    else if (err instanceof NotFoundError) code = 'not_found';
    else if (err instanceof InsufficientFundsError) code = 'insufficient_funds';
    else if (err instanceof BankDeclineError) code = 'bank_decline';
    else if (err instanceof InvalidCardError) code = 'invalid_card_details';
    else if (err instanceof NotUniqueEmail) code = 'not_unique_email';
    else if (err instanceof RightsError) code = 'rights_error';
    else if (err instanceof TokenError) code = 'token_error';
    else if (err instanceof UncorrectPassword) code = 'uncorrect_password';
    else code = 'application_error';
  } else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Validation error';
    userMessage = 'Invalid data provided. Please check your information.';
    code = 'validation_error';
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Foreign key constraint error';
    userMessage = 'Invalid reference. Please check your data.';
    code = 'foreign_key_violation';
  } else if (err.name === 'SequelizeConnectionError') {
    statusCode = 500;
    message = 'Database connection error';
    userMessage = 'Unable to connect to database. Please try again.';
    code = 'database_connection_error';
  } else if (err instanceof SyntaxError && err.message.includes('JSON')) {
    statusCode = 400;
    message = 'Invalid JSON format';
    userMessage = 'Invalid data format provided.';
    code = 'invalid_json';
  }

  return {
    statusCode,
    message,
    userMessage,
    code,
    ...(err instanceof InsufficientFundsError && {
      balance: err.balance,
      required: err.required,
    }),
    ...(err instanceof BadRequestError && {
      missingFields: err.missingFields,
    }),
  };
};

module.exports = mapErrorToResponse;
