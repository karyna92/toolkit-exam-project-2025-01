const ApplicationError = require('./ApplicationError');

class DatabaseError extends ApplicationError {
  constructor(operation, entity, originalError = null, userMessage = null) {
    const defaultMessage = `Database operation failed: ${operation} on ${entity}`;
    const detailedMessage = originalError
      ? `${defaultMessage}. Original error: ${originalError.message}`
      : defaultMessage;

    super('Database Error', 500, userMessage || detailedMessage);

    this.operation = operation;
    this.entity = entity;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

module.exports = DatabaseError;
