const { Router } = require('express');
const userRouter = require('./userRouter');
const contestRouter = require('./contestRouter');
const chatRouter = require('./chatRouter');
const path = require('path');
const { FILES_PATH } = require('../config/path');
const fs = require('fs');
const router = Router();

router.use('/users', userRouter);
router.use('/contests', contestRouter);
router.use('/chat', chatRouter);

// Debug route to check files
// Add to your router
router.get('/test-file', (req, res) => {
  // Test with a known existing file
  const testFile = '1763932758331-signature.jpg';
  const filePath = path.join(FILES_PATH, testFile);
  if (fs.existsSync(filePath)) {
    res.json({
      message: 'File exists',
      staticUrl: `/files/${testFile}`,
      directUrl: `http://localhost:3000/files/${testFile}`
    });
  } else {
    res.json({ error: 'Test file not found' });
  }
});

module.exports = router;
