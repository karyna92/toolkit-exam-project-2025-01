const fs = require('fs');
const path = require('path');
const { normalizeError, parseStack } = require('../helpers/errorHelpers');
const { LOG_PATH } = require('../config/path');

function logError(error, code = 500, logFile = LOG_PATH) {
  const dir = path.dirname(logFile);

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const err = normalizeError(error);

  const logEntry = {
    message: err.message,
    time: Date.now(),
    code: code || err.code || 500,
    stackTrace: parseStack(err.stack),
  };

  try {
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n', 'utf8');
  } catch (writeErr) {
    console.error('Failed to write error log:', writeErr);
    console.error('Original error was:', err);
  }
}
module.exports = logError;
