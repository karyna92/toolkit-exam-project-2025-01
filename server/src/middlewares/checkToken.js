const jwt = require('jsonwebtoken');
const CONSTANTS = require('../constants');
const { TokenError, NotFoundError } = require('../errors');
const userQueries = require('../queries/userQueries');

module.exports.checkAuth = async (req, res, next) => {
  const accessToken = req.headers.authorization;
  if (!accessToken) return next(new TokenError('Token is required'));

  try {
    const tokenData = jwt.verify(accessToken, CONSTANTS.JWT_SECRET);
    const foundUser = await userQueries.findUser({ id: tokenData.userId });

    if (!foundUser) return next(new NotFoundError('User not found'));

    res.send({
      firstName: foundUser.firstName,
      lastName: foundUser.lastName,
      role: foundUser.role,
      id: foundUser.id,
      avatar: foundUser.avatar,
      displayName: foundUser.displayName,
      balance: foundUser.balance,
      email: foundUser.email,
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError')
      return next(new TokenError('Invalid token'));
    if (err.name === 'TokenExpiredError')
      return next(new TokenError('Token expired'));
    next(err);
  }
};

module.exports.checkToken = async (req, res, next) => {

  const authHeader = req.headers.authorization;
  console.log('authHeader', authHeader);
  if (!authHeader) return next(new TokenError('Token is required'));

  const accessToken = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;
  console.log(' accessToken', accessToken);
  try {
    req.tokenData = jwt.verify(accessToken, CONSTANTS.JWT_SECRET);
    console.log('tokenData', req.tokenData);
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError')
      return next(new TokenError('Invalid token'));
    if (err.name === 'TokenExpiredError')
      return next(new TokenError('Token expired'));
    next(err);
  }
};
