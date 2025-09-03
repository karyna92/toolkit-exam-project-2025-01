const { Router } = require('express');
const userRouter = require('./userRouter');
const contestRouter = require('./contestRouter');
const chatRouter = require('./chatRouter');

const router = Router();

router.use('/users', userRouter);
router.use('/contests', contestRouter);
router.use('/chat', chatRouter);

module.exports = router;
