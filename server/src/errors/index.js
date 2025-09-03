const ApplicationError = require('./ApplicationError');
const BadRequestError = require('./BadRequestError');
const NotFoundError = require('./NotFoundError');
const ServerError = require('./ServerError');
const DevAlreadyExistError = require('./DevAlreadyExistError');
const BankDeclineError = require('./BankDeclineError');
const NotEnoughMoney = require('./NotEnoughMoney');
const NotUniqueEmail = require('./NotUniqueEmail');
const RightsError = require('./RightsError');
const UncorrectPassword = require('./UncorrectPassword');
const TokenError = require('./TokenError');

module.exports = {
  ApplicationError,
  BadRequestError,
  NotFoundError,
  ServerError,
  BankDeclineError,
  DevAlreadyExistError,
  NotEnoughMoney,
  NotUniqueEmail,
  RightsError,
  UncorrectPassword,
  TokenError,
};
