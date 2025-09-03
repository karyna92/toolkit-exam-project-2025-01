const express = require('express');
const cors = require('cors');
const router = require('./router');
const errorHandler = require('./handlerErrors/errorHandler');
const { FILES_PATH } = require('./config/path');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/images', express.static(FILES_PATH));
app.use('/api', router);
app.use(errorHandler);

module.exports = app;
