const bcrypt = require('bcrypt');
const { ServerError } = require('../errors');
const CONSTANTS = require('../constants');

module.exports = async (req, res, next) => {
  try {
    req.hashPass = await bcrypt.hash(req.body.password, CONSTANTS.SALT_ROUNDS);
    next();
  } catch (err) {
    next(new ServerError('Server Error on hash password'));
  }
};
