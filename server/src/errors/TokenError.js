const ApplicationError = require('./ApplicationError');

class TokenError extends ApplicationError {
  constructor(message) {
    super(message || 'token error', 401);
  }
}

module.exports = TokenError;
