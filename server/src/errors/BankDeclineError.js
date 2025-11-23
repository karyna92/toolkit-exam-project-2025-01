const ApplicationError = require('./ApplicationError');

class BankDeclineError extends ApplicationError {
  constructor(
    message = 'Bank declined the transaction',
    userMessage = 'Your card was declined. Please check your card details or try a different payment method.'
  ) {
    super(message, 402, userMessage);
  }
}

module.exports = BankDeclineError;
