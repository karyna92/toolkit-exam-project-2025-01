const { Router } = require('express');
const userController = require('../controllers/userController');
const basicMiddlewares = require('../middlewares/basicMiddlewares');
const validators = require('../middlewares/validators');
const hashPass = require('../middlewares/hashPassMiddle');
const checkToken = require('../middlewares/checkToken');
const { uploadSingle, uploadArray } = require('../utils/fileUpload');

const UserRouter = Router();

UserRouter.post(
  '/registration',
  validators.validateRegistrationData,
  hashPass,
  userController.registration
);

UserRouter.post('/login', validators.validateLogin, userController.login);
UserRouter.route('/user')
  .get(checkToken.checkAuth)
  .put(checkToken.checkToken, uploadSingle('file'), userController.updateUser);

UserRouter.put(
  '/user/offers/rating',
  checkToken.checkToken,
  basicMiddlewares.onlyForCustomer,
  userController.changeMark
);

///bank operations

UserRouter.post(
  '/user/payments',
  checkToken.checkToken,
  basicMiddlewares.onlyForCustomer,
  uploadArray('files'),
  basicMiddlewares.parseBody,
  validators.validateContestCreation,
  userController.payment
);

UserRouter.post(
  '/user/cashouts',
  checkToken.checkToken,
  basicMiddlewares.onlyForCreative,
  userController.cashout
);
module.exports = UserRouter;
