const { Router } = require('express');
const checkToken = require('../middlewares/checkToken');
const contestController = require('../controllers/contestController');
const basicMiddlewares = require('../middlewares/basicMiddlewares');
const { uploadSingle } = require('../utils/fileUpload');

const contestRouter = Router();

contestRouter.get(
  '/',
  checkToken.checkToken,
  basicMiddlewares.onlyForCreative,
  contestController.getContests
);

contestRouter.get(
  '/offers',
  checkToken.checkToken,
  basicMiddlewares.onlyForModerator,
  contestController.getContestsWithOffers
);

contestRouter.get(
  '/customer',
  checkToken.checkToken,
  contestController.getCustomersContests
);

contestRouter.get(
  '/:contestId',
  checkToken.checkToken,
  basicMiddlewares.canGetContest,
  contestController.getContestById
);

contestRouter.put(
  '/update',
  checkToken.checkToken,
  uploadSingle('file'),
  contestController.updateContest
);

// Download contest file
contestRouter.get(
  '/:contestId/files/:fileName',
  checkToken.checkToken,
  contestController.downloadFile
);

contestRouter.post(
  '/dataForContest',
  checkToken.checkToken,
  contestController.dataForContest
);

contestRouter.post(
  '/newOffer',
  checkToken.checkToken,
  uploadSingle('file'),
  basicMiddlewares.canSendOffer,
  contestController.setNewOffer
);

contestRouter.post(
  '/setOfferStatus',
  checkToken.checkToken,
  basicMiddlewares.onlyForCustomerWhoCreateContestAndModerator,
  contestController.setOfferStatus
);

module.exports = contestRouter;
