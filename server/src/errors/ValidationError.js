const ApplicationError = require('./ApplicationError');

class ValidationError extends ApplicationError {
  constructor(
    message = 'Validation failed',
    userMessage = 'Please check your information and try again.'
  ) {
    super(message, 400, userMessage);
  }
}

module.exports = ValidationError;
