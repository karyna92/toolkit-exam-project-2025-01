const db = require('../models/postgresModels');
const { ServerError, NotFoundError, BadRequestError } = require('../errors');
const contestQueries = require('../queries/contestQueries');
const userQueries = require('../queries/userQueries');
const controller = require('../sockets/socketInit');
const UtilFunctions = require('../utils/functions');
const contestService = require('../services/contestService');
const CONSTANTS = require('../constants');

module.exports.dataForContest = async (req, res, next) => {
  const response = {};
  try {
    const {
      body: { characteristic1, characteristic2 },
    } = req;
    console.log(req.body, characteristic1, characteristic2);
    const types = [characteristic1, characteristic2, 'industry'].filter(
      Boolean
    );

    const characteristics = await db.Selects.findAll({
      where: {
        type: {
          [db.Sequelize.Op.or]: types,
        },
      },
    });
    if (!characteristics) {
      return next(new ServerError());
    }
    characteristics.forEach((characteristic) => {
      if (!response[characteristic.type]) {
        response[characteristic.type] = [];
      }
      response[characteristic.type].push(characteristic.describe);
    });
    res.send(response);
  } catch (err) {
    console.log(err);
    next(new ServerError('cannot get contest preferences'));
  }
};
module.exports.getContestById = async (req, res, next) => {
  const { contestId } = req.params;
  try {
    let contestInfo = await db.Contests.findOne({
      where: { id: contestId },
      order: [[db.Offers, 'id', 'asc']],
      include: [
        {
          model: db.Users,
          required: true,
          attributes: {
            exclude: ['password', 'role', 'balance', 'accessToken'],
          },
        },
        {
          model: db.Offers,
          required: false,
          where:
            req.tokenData.role === CONSTANTS.CREATOR
              ? { userId: req.tokenData.userId }
              : {},
          attributes: { exclude: ['userId', 'contestId'] },
          include: [
            {
              model: db.Users,
              required: true,
              attributes: {
                exclude: ['password', 'role', 'balance', 'accessToken'],
              },
            },
            {
              model: db.Ratings,
              required: false,
              where: { userId: req.tokenData.userId },
              attributes: { exclude: ['userId', 'offerId'] },
            },
          ],
        },
      ],
    });
    contestInfo = contestInfo.get({ plain: true });
    contestInfo.Offers.forEach((offer) => {
      if (offer.Rating) {
        offer.mark = offer.Rating.mark;
      }
      delete offer.Rating;
    });
    res.send(contestInfo);
  } catch (e) {
    next(new ServerError());
  }
};

module.exports.getContests = async (req, res, next) => {
  try {
    const {
      typeIndex,
      contestId,
      industry,
      awardSort,
      limit: rawLimit,
      offset: rawOffset,
      ownEntries: rawOwnEntries,
    } = req.query;

    const limit = rawLimit ? Number(rawLimit) : 10;
    const offset = rawOffset ? Number(rawOffset) : 0;
    const ownEntries = rawOwnEntries === 'true' || rawOwnEntries === true;

    const predicates = UtilFunctions.createWhereForAllContests(
      typeIndex,
      contestId,
      industry,
      awardSort
    );
    const contests = await db.Contests.findAll({
      where: predicates.where,
      order: predicates.order,
      limit,
      offset,
      include: [
        {
          model: db.Offers,
          required: ownEntries,
          where: ownEntries ? { userId: req.tokenData.userId } : {},
          attributes: ['id'],
        },
      ],
    });
    contests.forEach(
      (contest) => (contest.dataValues.count = contest.dataValues.Offers.length)
    );

    const haveMore = contests.length > 0;

    res.send({ contests, haveMore });
  } catch (err) {
    console.error(err);
    next(new ServerError('Failed to fetch contests'));
  }
};
module.exports.getCustomersContests = (req, res, next) => {
  const { limit, offset = 0, status } = req.query;
  if (!status) return next(new BadRequestError('Status query param required'));
  db.Contests.findAll({
    where: { status, userId: req.tokenData.userId },
    limit,
    offset,
    order: [['id', 'DESC']],
    include: [
      {
        model: db.Offers,
        required: false,
        attributes: ['id'],
      },
    ],
  })
    .then((contests) => {
      contests.forEach(
        (contest) =>
          (contest.dataValues.count = contest.dataValues.Offers.length)
      );
      let haveMore = true;
      if (contests.length === 0) {
        haveMore = false;
      }
      res.send({ contests, haveMore });
    })
    .catch((err) => next(new ServerError(err)));
};

module.exports.downloadFile = async (req, res, next) => {
  const contest = await db.Contests.findByPk(req.params.contestId);
  if (!contest) return next(new NotFoundError('Contest not found'));
  const file = CONSTANTS.CONTESTS_DEFAULT_DIR + req.params.fileName;
  res.download(file); /////also take a look maybe ork with path , fs
};

module.exports.updateContest = async (req, res, next) => {
  console.log(req.body);
  if (req.file) {
    req.body.fileName = req.file.filename;
    req.body.originalFileName = req.file.originalname;
  }
  const contestId = req.body.contestId;
  delete req.body.contestId;
  try {
    const updatedContest = await contestQueries.updateContest(req.body, {
      id: contestId,
      userId: req.tokenData.userId,
    });
    res.send(updatedContest);
  } catch (e) {
    next(e);
  }
};

module.exports.setNewOffer = async (req, res, next) => {
  try {
    const obj = contestService.buildOfferObject(req);
    const result = await contestQueries.createOffer(obj);

    const plainResult = result.get ? result.get({ plain: true }) : result;
    delete plainResult.contestId;
    delete plainResult.userId;

    controller
      .getNotificationController()
      .emitEntryCreated(req.body.customerId);
    const User = { ...req.tokenData, id: req.tokenData.userId };

    res.send({ ...plainResult, User });
  } catch (err) {
    next(new ServerError(err.message));
  }
}; /// still take a look here

module.exports.setOfferStatus = async (req, res, next) => {
  const t = await db.sequelize.transaction();
  try {
    const { command } = req.body;

    if (command === 'reject') {
      const offer = await contestService.rejectOffer(
        req.body.offerId,
        req.body.creatorId,
        req.body.contestId,
        t
      );
      await t.commit();
      return res.send(offer);
    }

    if (command === 'resolve') {
      const winningOffer = await contestService.resolveOffer(
        req.body.contestId,
        req.body.creatorId,
        req.body.orderId,
        req.body.offerId,
        req.body.priority,
        t
      );
      await t.commit();
      return res.send(winningOffer);
    }

    await t.rollback();
    return next(new ServerError('Unknown command'));
  } catch (err) {
    await t.rollback();
    next(err);
  }
};
