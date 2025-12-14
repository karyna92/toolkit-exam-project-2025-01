const db = require('../models');
const contestQueries = require('../queries/contestQueries');
const userQueries = require('../queries/userQueries');
const CONSTANTS = require('../constants');
const { BadRequestError, ServerError } = require('../errors');

module.exports.buildOfferObject = (req) => {
  const obj = {};

  if (req.body.contestType === CONSTANTS.LOGO_CONTEST) {
    if (!req.file) throw new BadRequestError('Logo file is required');
    obj.fileName = req.file.filename;
    obj.originalFileName = req.file.originalname;
  } else {
    if (!req.body.offerData)
      throw new BadRequestError('Offer text is required');
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

  return rejectedOffer;
};

module.exports.declineOffer = async (offerId, creatorId, contestId) => {
  const declinedOffer = await contestQueries.updateOffer(
    { status: CONSTANTS.OFFER_STATUS_DECLINED },
    { id: offerId }
  );
  return declinedOffer;
};

module.exports.approveOffer = async (offerId, creatorId, contestId) => {
  const approvedOffer = await contestQueries.updateOffer(
    { status: CONSTANTS.OFFER_STATUS_APPROVED },
    { id: offerId }
  );

  return approvedOffer;
};

module.exports.resolveOffer = async (
  role,
  contestId,
  creatorId,
  orderId,
  offerId,
  priority,
  transaction
) => {
  try {
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

    await contestQueries.updateOfferStatus(
      { status: CONSTANTS.OFFER_STATUS_WON },
      { id: offerId },
      transaction
    );

    await contestQueries.updateOfferStatus(
      { status: CONSTANTS.OFFER_STATUS_REJECTED },
      {
        contestId: contestId,
        id: { [db.Sequelize.Op.ne]: offerId },
        status: CONSTANTS.OFFER_STATUS_APPROVED,
      },
      transaction
    );

    await contestQueries.updateOfferStatus(
      { status: CONSTANTS.OFFER_STATUS_DECLINED },
      {
        contestId: contestId,
        id: { [db.Sequelize.Op.ne]: offerId },
        status: CONSTANTS.OFFER_STATUS_PENDING,
      },
      transaction
    );

    const updatedOffers = await db.Offers.findAll({
      where: { contestId: contestId },
      include: [
        {
          model: db.Users,
          attributes: ['id', 'role', 'displayName', 'email'],
        },
      ],
      transaction,
    });

    const arrayRoomsId = updatedOffers
      .filter(
        (o) =>
          o.status === CONSTANTS.OFFER_STATUS_REJECTED && o.userId !== creatorId
      )
      .map((o) => o.userId);

    return updatedOffers.find((o) => o.id === offerId)?.dataValues;
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError(`Failed to resolve offer: ${error.message}`);
  }
};
