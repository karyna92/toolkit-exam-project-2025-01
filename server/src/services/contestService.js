const db = require('../models');
const contestQueries = require('../queries/contestQueries');
const userQueries = require('../queries/userQueries');
const controller = require('../sockets/socketInit');
const CONSTANTS = require('../constants');

module.exports.buildOfferObject = (req) => {
  const obj = {};

  if (req.body.contestType === CONSTANTS.LOGO_CONTEST) {
    if (!req.file) throw new Error('Logo file is required');
    obj.fileName = req.file.filename;
    obj.originalFileName = req.file.originalname;
  } else {
    if (!req.body.offerData) throw new Error('Offer text is required');
    obj.text = req.body.offerData;
  }

  obj.userId = req.tokenData.userId;
  obj.contestId = req.body.contestId;

  return obj;
};

module.exports.rejectOffer = async (offerId, creatorId, contestId) => {
  const rejectedOffer = await contestQueries.updateOffer(
    { status: CONSTANTS.OFFER_STATUS_REJECTED },
    { id: offerId }
  );
  controller
    .getNotificationController()
    .emitChangeOfferStatus(
      creatorId,
      'Someone of yours offers was rejected',
      contestId
    );
  return rejectedOffer;
};

module.exports.resolveOffer = async (
  contestId,
  creatorId,
  orderId,
  offerId,
  priority,
  transaction
) => {
  const finishedContest = await contestQueries.updateContestStatus(
    {
      status: db.sequelize.literal(`
        CASE
          WHEN "id"=${contestId} AND "orderId"='${orderId}'
            THEN '${CONSTANTS.CONTEST_STATUS_FINISHED}'
          WHEN "orderId"='${orderId}' AND "priority"=${priority + 1}
            THEN '${CONSTANTS.CONTEST_STATUS_ACTIVE}'
          ELSE '${CONSTANTS.CONTEST_STATUS_PENDING}'
        END
      `),
    },
    { orderId },
    transaction
  );

  await userQueries.updateUser(
    { balance: db.sequelize.literal('balance + ' + finishedContest.prize) },
    creatorId,
    transaction
  );

  const updatedOffers = await contestQueries.updateOfferStatus(
    {
      status: db.sequelize.literal(`
        CASE
          WHEN "id"=${offerId} THEN '${CONSTANTS.OFFER_STATUS_WON}'
          ELSE '${CONSTANTS.OFFER_STATUS_REJECTED}'
        END
      `),
    },
    { contestId },
    transaction
  );

  const arrayRoomsId = updatedOffers
    .filter(
      (o) =>
        o.status === CONSTANTS.OFFER_STATUS_REJECTED && o.userId !== creatorId
    )
    .map((o) => o.userId);

  controller
    .getNotificationController()
    .emitChangeOfferStatus(
      arrayRoomsId,
      'Someone of yours offers was rejected',
      contestId
    );
  controller
    .getNotificationController()
    .emitChangeOfferStatus(creatorId, 'Someone of your offers WIN', contestId);

  return updatedOffers[0].dataValues;
};
