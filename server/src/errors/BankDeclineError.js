const ApplicationError = require('./ApplicationError');

class BankDeclineError extends ApplicationError {
  constructor(message) {
    super(message || 'Bank decline transaction', 402);
  }
}

module.exports = BankDeclineError;
