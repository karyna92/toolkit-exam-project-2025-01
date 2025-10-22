const db = require('../models');
const { ServerError } = require('../errors');

module.exports.updateContest = async (data, predicate, transaction) => {
  const [updatedCount, [updatedContest]] = await db.Contests.update(data, {
    where: predicate,
    returning: true,
    transaction,
  });
  if (updatedCount !== 1) {
    throw new ServerError('cannot update Contest');
  } else {
    return updatedContest.dataValues;
  }
};

// module.exports.updateOffer = async (data, predicate, transaction) => {
//   const [updatedCount, [updatedOffer]] = await db.Offers.update(data, {
//     where: predicate,
//     returning: true,
//     transaction,
//   });
//   if (updatedCount !== 1) {
//     throw new ServerError('cannot update offer!');
//   } else {
//     return updatedOffer.dataValues;
//   }
// };
module.exports.updateOffer = async (data, predicate, transaction) => {
  const [updatedCount, [updatedOffer]] = await db.Offers.update(data, {
    where: predicate,
    returning: true,
    transaction,
  });

  if (updatedCount !== 1) {
    throw new ServerError('cannot update offer!');
  }

  const offerWithUser = await db.Offers.findOne({
    where: { id: updatedOffer.id },
    include: [
      {
        model: db.Users,
        attributes: ['email', 'firstName'],
      },
    ],
    transaction,
  });

  return offerWithUser;
};


module.exports.createOffer = async (data) => {
  const result = await db.Offers.create(data);
  if (!result) {
    throw new ServerError('cannot create new Offer');
  } else {
    return result.get({ plain: true });
  }
};


module.exports.updateOfferStatus = async (data, filter, transaction) => {

  try {
    const [updatedCount, updatedOffers] = await db.Offers.update(data, {
      where: filter,
      transaction,
      returning: true,
    });

    return updatedOffers || [];
  } catch (error) {
    throw error;
  }
};

module.exports.updateContestStatus = async (data, filter, transaction) => {

  try {
    const [updatedCount, updatedContests] = await db.Contests.update(data, {
      where: filter,
      transaction,
      returning: true,
    });
    return updatedContests?.[0] || null;
  } catch (error) {
    throw error;
  }
};

