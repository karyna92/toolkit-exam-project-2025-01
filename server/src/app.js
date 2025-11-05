const express = require('express');
const cors = require('cors');
const router = require('./router');
const errorHandler = require('./handlerErrors/errorHandler');
const { FILES_PATH } = require('./config/path');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use('/images', express.static(FILES_PATH));
app.use('/api', router);
app.use(errorHandler);

module.exports = app;
