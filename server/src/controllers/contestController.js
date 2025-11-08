const db = require('../models');
const { ServerError, NotFoundError, BadRequestError } = require('../errors');
const contestQueries = require('../queries/contestQueries');
const controller = require('../sockets/socketInit');
const UtilFunctions = require('../utils/functions');
const { mailing } = require('../utils/mailing');
const contestService = require('../services/contestService');
const CONSTANTS = require('../constants');

module.exports.dataForContest = async (req, res, next) => {
  const response = {};
  try {
    const { body } = req;
  
    const characteristic1 = body?.characteristic1 || '';
    const characteristic2 = body?.characteristic2 || '';

    const types = [characteristic1, characteristic2, 'industry'].filter(
      Boolean
    )

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
      ownEntries: rawOwnEntries,
      limit = 5,
      offset = 0,
    } = req.query;

    const parsedLimit = parseInt(limit);
    const parsedOffset = parseInt(offset);
    const ownEntries = rawOwnEntries === 'true' || rawOwnEntries === true;

    const predicates = UtilFunctions.createWhereForAllContests(
      typeIndex,
      contestId,
      industry,
      awardSort
    );

    const totalCount = await db.Contests.count({
      where: predicates.where,
    });

    const contests = await db.Contests.findAll({
      where: predicates.where,
      order: [['prize', 'asc'], ['id', 'DESC']],
      limit: parsedLimit,
      offset: parsedOffset,
    });

    const contestsWithOffers = await Promise.all(
      contests.map(async (contest) => {
        const offers = await db.Offers.findAll({
          where: {
            contestId: contest.id,
            ...(ownEntries ? { userId: req.tokenData.userId } : {}),
          },
          attributes: ['id'],
        });

        return {
          ...contest.dataValues,
          Offers: offers,
          count: offers.length,
        };
      })
    );

    const haveMore = parsedOffset + parsedLimit < totalCount;

    res.send({
      contests: contestsWithOffers,
      haveMore,
      totalCount,
      currentPage: Math.floor(parsedOffset / parsedLimit) + 1,
      totalPages: Math.ceil(totalCount / parsedLimit),
    });
  } catch (err) {
    console.error(err);
    next(new ServerError('Failed to fetch contests'));
  }
};

module.exports.getCustomersContests = async (req, res, next) => {
  try {
    const {
      status,
      limit = 5,
      offset = 0,
    } = req.query;

    if (!status) {
      return next(new BadRequestError('Status query param required'));
    }

    const parsedLimit = parseInt(limit);
    const parsedOffset = parseInt(offset);

    const whereClause = {
      status: status,
      userId: req.tokenData.userId 
    };

    const totalCount = await db.Contests.count({
      where: whereClause,
    });

    const contests = await db.Contests.findAll({
      where: whereClause,
      order: [['id', 'DESC']], 
      limit: parsedLimit,
      offset: parsedOffset,
      include: [
        {
          model: db.Offers,
          required: false,
          attributes: ['id'],
          where: {
            status: {
              [db.Sequelize.Op.notIn]: [
                CONSTANTS.OFFER_STATUS_PENDING,
                CONSTANTS.OFFER_STATUS_DECLINED,
              ],
            },
          },
        },
      ],
    });

    contests.forEach(
      (contest) => (contest.dataValues.count = contest.dataValues.Offers.length)
    );

    const haveMore = parsedOffset + parsedLimit < totalCount;

    res.send({
      contests,
      haveMore,
      totalCount,
      currentPage: Math.floor(parsedOffset / parsedLimit) + 1,
      totalPages: Math.ceil(totalCount / parsedLimit),
    });
  } catch (err) {
    console.error(err);
    next(new ServerError('Failed to fetch customer contests'));
  }
};

module.exports.downloadFile = async (req, res, next) => {
  const contest = await db.Contests.findByPk(req.params.contestId);
  if (!contest) return next(new NotFoundError('Contest not found'));
  const file = CONSTANTS.CONTESTS_DEFAULT_DIR + req.params.fileName;
  res.download(file);
};

module.exports.updateContest = async (req, res, next) => {
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
};

module.exports.setOfferStatus = async (req, res, next) => {
  const t = await db.sequelize.transaction();
  const { role } = req.tokenData;
  try {
    const { command, offerId, creatorId, contestId } = req.body;

    if (command === 'reject') {
      const offer = await contestService.rejectOffer(
        offerId,
        creatorId,
        contestId,
        t
      );
      await t.commit();

      controller
        .getNotificationController()
        .emitChangeOfferStatus(
          creatorId,
          'Someone of yours offers was rejected',
          contestId
        );

      return res.send(offer);
    }

    if (command === 'decline' && role === CONSTANTS.MODERATOR) {
      const offer = await contestService.declineOffer(
        offerId,
        creatorId,
        contestId,
        t
      );
      await t.commit();
      try {
        await mailing(
          offer.User.email,
          'Offer Declined ❌',
          `<p>Hi ${offer.User.firstName}, your offer <strong>${offer.text}</strong> was declined by the moderator!</p>`
        );
      } catch (emailError) {
        console.error('Failed to send decline email:', emailError);
      }

      return res.send(offer);
    }

    if (command === 'approve' && role === CONSTANTS.MODERATOR) {
      const approvedOffer = await contestService.approveOffer(
        offerId,
        creatorId,
        contestId,
        t
      );
      await t.commit();

      try {
        await mailing(
          approvedOffer.User.email,
          'Offer Approved ✅',
          `<p>Hi ${approvedOffer.User.firstName}, your offer <strong>${approvedOffer.text}</strong> was approved by the moderator!</p>`
        );
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
      }

      return res.send(approvedOffer);
    }

    if (command === 'resolve') {
      const winningOffer = await contestService.resolveOffer(
        role,
        contestId,
        creatorId,
        req.body.orderId,
        offerId,
        req.body.priority,
        t
      );
      await t.commit();

      controller
        .getNotificationController()
        .emitChangeOfferStatus(creatorId, 'Your offer has won', contestId);

      return res.send(winningOffer);
    }

    await t.rollback();
    return next(new ServerError('Unknown command'));
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

module.exports.getContestsWithOffers = async (req, res, next) => {
  try {
    const { status, page = 1 } = req.query;
    const rowsPerPage = 20;
    const offset = (page - 1) * rowsPerPage;

    const offerWhere = {};
    if (status && status !== 'all') {
      offerWhere.status = status;
    }

    const totalOffersCount = await db.Offers.count({
      include: [
        {
          model: db.Contests,
          where: { status: ['active', 'finished'] },
          required: true,
        },
      ],
      where: offerWhere,
    });

    const contests = await db.Contests.findAll({
      where: { status: ['active', 'finished'] },
      include: [
        {
          model: db.Offers,
          required: true,
          where: offerWhere,
          attributes: [
            'id',
            'status',
            'text',
            'fileName',
            'createdAt',
            'contestId',
            'userId',
          ],
        },
      ],
      order: [['id', 'DESC']],
    });

    const allOffers = [];
    contests.forEach((contest) => {
      contest.Offers.forEach((offer) => {
        allOffers.push({
          ...offer.toJSON(),
          Contest: {
            id: contest.id,
            title: contest.title,
            contestType: contest.contestType,
            status: contest.status,
            prize: contest.prize,
            industry: contest.industry,
            focusOfWork: contest.focusOfWork,
            targetCustomer: contest.targetCustomer,
          },
        });
      });
    });

    allOffers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const paginatedOffers = allOffers.slice(offset, offset + rowsPerPage);

    const contestsMap = new Map();
    paginatedOffers.forEach((offer) => {
      const contestId = offer.Contest.id;
      if (!contestsMap.has(contestId)) {
        contestsMap.set(contestId, {
          ...offer.Contest,
          Offers: [],
        });
      }
      contestsMap.get(contestId).Offers.push({
        id: offer.id,
        status: offer.status,
        text: offer.text,
        fileName: offer.fileName,
        createdAt: offer.createdAt,
        contestId: offer.contestId,
        userId: offer.userId,
      });
    });

    const paginatedContests = Array.from(contestsMap.values());
    const totalPages = Math.ceil(totalOffersCount / rowsPerPage);

    res.send({
      contests: paginatedContests,
      totalCount: totalOffersCount,
      currentPage: parseInt(page),
      totalPages: totalPages,
    });
  } catch (err) {
    console.error('Error in getContestsWithOffers:', err);
    next(new ServerError('Failed to fetch contests with offers'));
  }
};
