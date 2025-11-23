const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');
const moment = require('moment');
const db = require('../models');
const {
  NotUniqueEmail,
  BankDeclineError,
  BadRequestError,
  InsufficientFundsError,
  InvalidCardError,
  ValidationError,
} = require('../errors');
const controller = require('../sockets/socketInit');
const userQueries = require('../queries/userQueries');
const bankQueries = require('../queries/bankQueries');
const ratingQueries = require('../queries/ratingQueries');
const CONSTANTS = require('../constants');

module.exports.login = async (req, res, next) => {
  try {
    const foundUser = await userQueries.findUser({ email: req.body.email });
    await userQueries.passwordCompare(req.body.password, foundUser.password);
    const accessToken = jwt.sign(
      {
        firstName: foundUser.firstName,
        userId: foundUser.id,
        role: foundUser.role,
        lastName: foundUser.lastName,
        avatar: foundUser.avatar,
        displayName: foundUser.displayName,
        balance: foundUser.balance,
        email: foundUser.email,
        rating: foundUser.rating,
      },
      CONSTANTS.JWT_SECRET,
      { expiresIn: CONSTANTS.ACCESS_TOKEN_TIME }
    );
    await userQueries.updateUser({ accessToken }, foundUser.id);
    res.send({ token: accessToken });
  } catch (err) {
    next(err);
  }
};
module.exports.registration = async (req, res, next) => {
  try {
    const newUser = await userQueries.userCreation(
      Object.assign(req.body, { password: req.hashPass })
    );
    const accessToken = jwt.sign(
      {
        firstName: newUser.firstName,
        userId: newUser.id,
        role: newUser.role,
        lastName: newUser.lastName,
        avatar: newUser.avatar,
        displayName: newUser.displayName,
        balance: newUser.balance,
        email: newUser.email,
        rating: newUser.rating,
      },
      CONSTANTS.JWT_SECRET,
      { expiresIn: CONSTANTS.ACCESS_TOKEN_TIME }
    );
    await userQueries.updateUser({ accessToken }, newUser.id);
    res.send({ token: accessToken });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      next(new NotUniqueEmail());
    } else {
      next(err);
    }
  }
};
module.exports.updateUser = async (req, res, next) => {
  console.log('Update request received:', req.body);
  try {
    if (req.file) {
      req.body.avatar = req.file.filename;
    }
    const updatedUser = await userQueries.updateUser(
      req.body,
      req.tokenData.userId
    );
    res.send({
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      displayName: updatedUser.displayName,
      avatar: updatedUser.avatar,
      email: updatedUser.email,
      balance: updatedUser.balance,
      role: updatedUser.role,
      id: updatedUser.id,
    });
  } catch (err) {
    next(err);
  }
};
module.exports.changeMark = async (req, res, next) => {
  let sum = 0;
  let avg = 0;
  let transaction;
  const { isFirst, offerId, mark, creatorId } = req.body;
  const userId = req.tokenData.userId;
  try {
    transaction = await db.sequelize.transaction({
      isolationLevel:
        db.Sequelize.Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
    });
    const query = ratingQueries.getQuery(
      offerId,
      userId,
      mark,
      isFirst,
      transaction
    );
    await query();
    const offersArray = await db.Ratings.findAll({
      include: [
        {
          model: db.Offers,
          required: true,
          where: { userId: creatorId },
        },
      ],
      transaction,
    });
    for (let i = 0; i < offersArray.length; i++) {
      sum += offersArray[i].dataValues.mark;
    }
    avg = sum / offersArray.length;

    await userQueries.updateUser({ rating: avg }, creatorId, transaction);
    await transaction.commit();
    controller.getNotificationController().emitChangeMark(creatorId);
    res.send({ userId: creatorId, rating: avg });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
};
module.exports.payment = async (req, res, next) => {
  let transaction;
  try {
    const { number, expiry, cvc, price, contests, name } = req.body;

    if (!number || !expiry || !cvc || !price || !contests || !name) {
      throw new BadRequestError(
        ['number', 'expiry', 'cvc', 'price', 'contests', 'name'],
        'Please fill in all required payment information.'
      );
    }

    if (typeof name !== 'string' || name.trim().length < 2) {
      throw new ValidationError(
        'Invalid cardholder name',
        'Please enter a valid cardholder name (minimum 2 characters).'
      );
    }

    const cleanNumber = number.replace(/\s/g, '');
    const cleanExpiry = expiry;
    const cleanName = name.trim();

    transaction = await db.sequelize.transaction();

    const customerCard = await db.Banks.findOne({
      where: {
        cardNumber: cleanNumber,
        name: cleanName,
        cvc: cvc,
        expiry: cleanExpiry,
      },
      transaction,
    });

    if (!customerCard) {
      throw new InvalidCardError(
        'The provided card details are not valid',
        'The card details you entered are not valid. Please check your card number, name, expiry date, and CVC.'
      );
    }

    const paymentAmount = parseFloat(price);
    if (customerCard.balance < paymentAmount) {
      throw new InsufficientFundsError(customerCard.balance, paymentAmount);
    }

    const customerUpdate = await db.Banks.update(
      { balance: db.sequelize.literal(`"balance" - ${paymentAmount}`) },
      {
        where: {
          cardNumber: cleanNumber,
          name: cleanName,
          cvc: cvc,
          expiry: cleanExpiry,
        },
        transaction,
      }
    );

    if (customerUpdate[0] === 0) {
      throw new BankDeclineError(
        'Unable to process payment',
        'Unable to process payment. Please try again.'
      );
    }

    const bankUpdate = await db.Banks.update(
      { balance: db.sequelize.literal(`"balance" + ${paymentAmount}`) },
      {
        where: {
          cardNumber: CONSTANTS.SQUADHELP_BANK_NUMBER,
          cvc: CONSTANTS.SQUADHELP_BANK_CVC,
          expiry: CONSTANTS.SQUADHELP_BANK_EXPIRY,
        },
        transaction,
      }
    );

    if (bankUpdate[0] === 0) {
      throw new BankDeclineError(
        'Unable to complete transaction',
        'Unable to complete transaction. Please contact support.'
      );
    }

    const orderId = uuid();
    const contestList =
      typeof contests === 'string' ? JSON.parse(contests) : contests;

    const contestPromises = contestList.map((contest, index) => {
      const prize =
        index === contestList.length - 1
          ? Math.ceil(paymentAmount / contestList.length)
          : Math.floor(paymentAmount / contestList.length);

      const contestData = {
        ...contest,
        status: index === 0 ? 'active' : 'pending',
        userId: req.tokenData.userId,
        priority: index + 1,
        orderId,
        prize,
      };

      return db.Contests.create(contestData, { transaction });
    });

    await Promise.all(contestPromises);
    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      orderId,
    });
  } catch (err) {
    if (transaction && !transaction.finished) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {}
    }

    next(err);
  }
};
module.exports.cashout = async (req, res, next) => {
  let transaction;
  try {
    transaction = await db.sequelize.transaction();
    const updatedUser = await userQueries.updateUser(
      { balance: db.sequelize.literal('balance - ' + req.body.sum) },
      req.tokenData.userId,
      transaction
    );
    await bankQueries.updateBankBalance(
      {
        balance: db.sequelize.literal(`CASE 
                WHEN "cardNumber"='${req.body.number.replace(
                  / /g,
                  ''
                )}' AND "expiry"='${req.body.expiry}' AND "cvc"='${
                  req.body.cvc
                }'
                    THEN "balance"+${req.body.sum}
                WHEN "cardNumber"='${
                  CONSTANTS.SQUADHELP_BANK_NUMBER
                }' AND "expiry"='${
                  CONSTANTS.SQUADHELP_BANK_EXPIRY
                }' AND "cvc"='${CONSTANTS.SQUADHELP_BANK_CVC}'
                    THEN "balance"-${req.body.sum}
                 END
                `),
      },
      {
        cardNumber: {
          [db.Sequelize.Op.in]: [
            CONSTANTS.SQUADHELP_BANK_NUMBER,
            req.body.number.replace(/ /g, ''),
          ],
        },
      },
      transaction
    );
    transaction.commit();
    res.send({ balance: updatedUser.balance });
  } catch (err) {
    transaction.rollback();
    next(err);
  }
};
