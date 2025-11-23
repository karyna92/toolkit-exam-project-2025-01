const ApplicationError = require('./ApplicationError');

class InvalidCardError extends ApplicationError {
  constructor(
    message = 'Invalid card details',
    userMessage = 'The card details you entered are not valid. Please check your card number, name, expiry date, and CVC.'
  ) {
    super(message, 402, userMessage);
  }
}

module.exports = InvalidCardError;
