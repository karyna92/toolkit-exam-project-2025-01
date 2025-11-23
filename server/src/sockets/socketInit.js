const { Server } = require('socket.io');
const ChatController = require('./ChatController');
const NotificationController = require('./NotificationController');

let notificationController;
let chatController;

const cors = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000',
  ],
  methods: ['GET', 'POST'],
  credentials: true,
};

module.exports.createConnection = (httpServer) => {
  const io = new Server(httpServer, { cors });
  notificationController = new NotificationController();
  notificationController.connect('/notifications', io);
  chatController = new ChatController();
  chatController.connect('/chat', io);
};

module.exports.getChatController = () => {
  return chatController;
};

module.exports.getNotificationController = () => {
  return notificationController;
};
