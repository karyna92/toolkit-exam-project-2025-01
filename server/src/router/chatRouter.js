const { Router } = require('express');
const chatController = require('../controllers/chatController');
const checkToken = require('../middlewares/checkToken');

const chatRouter = Router();

chatRouter.post(
  '/newMessage',
  checkToken.checkToken,
  chatController.addMessage
);

chatRouter.get('/', checkToken.checkToken, chatController.getChat);

chatRouter.get('/preview', checkToken.checkToken, chatController.getPreview);

chatRouter.put('/blackList', checkToken.checkToken, chatController.blackList);

chatRouter.put('/favorite', checkToken.checkToken, chatController.favoriteChat);

chatRouter.post(
  '/createCatalog',
  checkToken.checkToken,
  chatController.createCatalog
);

chatRouter.put(
  '/updateNameCatalog',
  checkToken.checkToken,
  chatController.updateNameCatalog
);

chatRouter.post(
  '/newChat',
  checkToken.checkToken,
  chatController.addNewChatToCatalog
);

chatRouter.put(
  '/removeChatFromCatalog',
  checkToken.checkToken,
  chatController.removeChatFromCatalog
);

chatRouter.delete(
  '/deleteCatalog',
  checkToken.checkToken,
  chatController.deleteCatalog
);

chatRouter.get('/catalogs', checkToken.checkToken, chatController.getCatalogs);

module.exports = chatRouter;
