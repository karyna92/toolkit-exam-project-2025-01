const path = require('path');
const env = process.env.NODE_ENV || 'development';

const FILES_PATH =
  env === 'production'
    ? '/var/www/html/public'
    : path.resolve(__dirname, '../../../public');
const IMAGES_PATH = path.join(FILES_PATH, 'images');
const LOG_PATH = path.resolve(__dirname, '../logs/errors.log');
const ARCHIVE_DIR = path.resolve(__dirname, '../logs/archive');

module.exports = {
  env,
  FILES_PATH,
  IMAGES_PATH,
  LOG_PATH,
  ARCHIVE_DIR,
};
