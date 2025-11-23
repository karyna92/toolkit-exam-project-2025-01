const ApplicationError = require('./ApplicationError');
const BadRequestError = require('./BadRequestError');
const NotFoundError = require('./NotFoundError');
const ServerError = require('./ServerError');
const DevAlreadyExistError = require('./DevAlreadyExistError');
const BankDeclineError = require('./BankDeclineError');
const NotUniqueEmail = require('./NotUniqueEmail');
const RightsError = require('./RightsError');
const UncorrectPassword = require('./UncorrectPassword');
const TokenError = require('./TokenError');
const InsufficientFundsError = require('./InsufficientFundsError');
const ValidationError = require('./ValidationError');
const InvalidCardError = require('./InvalidCardError');

module.exports = {
  ApplicationError,
  BadRequestError,
  NotFoundError,
  ServerError,
  BankDeclineError,
  DevAlreadyExistError,
  NotUniqueEmail,
  RightsError,
  UncorrectPassword,
  TokenError,
  ValidationError,
  InsufficientFundsError,
  InvalidCardError,
};
