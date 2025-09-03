const http = require('http');
require('dotenv').config();
const app = require('./app');
const controller = require('./sockets/socketInit');

const PORT = process.env.PORT || 3001;
const server = http.createServer(app);

server.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));

controller.createConnection(server);
