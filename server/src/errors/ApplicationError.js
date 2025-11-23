class ApplicationError extends Error {
  constructor(message, status = 500, userMessage) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.status = status;
    this.userMessage = userMessage || message;
  }
}

module.exports = ApplicationError;
