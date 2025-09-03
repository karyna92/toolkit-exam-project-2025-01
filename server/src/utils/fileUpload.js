const fs = require('fs');
const multer = require('multer');
const { FILES_PATH } = require('../config/path');
const { ServerError } = require('../errors');

if (!fs.existsSync(FILES_PATH)) fs.mkdirSync(FILES_PATH, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, FILES_PATH);
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const wrapUpload = (uploadMiddleware) => (req, res, next) => {
  console.log('Before upload:', req.body);
  uploadMiddleware(req, res, (err) => {
    if (!req.files) req.files = [];
    console.log('Uploaded files:', req.file || req.files);
    if (err) return next(new ServerError());
    next();
  });
};

module.exports.uploadSingle = (field) => wrapUpload(upload.single(field));
module.exports.uploadArray = (field, limit = 3) =>
  wrapUpload(upload.array(field, limit));
