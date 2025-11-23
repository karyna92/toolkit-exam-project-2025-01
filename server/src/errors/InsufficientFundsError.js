const ApplicationError = require('./ApplicationError');

class InsufficientFundsError extends ApplicationError {
  constructor(balance, required, userMessage = null) {
    const defaultMessage = `Your card has insufficient funds. Available balance: $${balance}. Required: $${required}.`;
    super('Insufficient funds', 402, userMessage || defaultMessage);
    this.balance = balance;
    this.required = required;
  }
}

module.exports = InsufficientFundsError;
