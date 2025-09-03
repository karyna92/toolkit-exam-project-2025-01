const db = require('../models/postgresModels');
const { ServerError } = require('../errors');

module.exports.updateRating = async (data, predicate, transaction) => {
  const [updatedCount, [updatedRating]] = await db.Ratings.update(data, {
    where: predicate,
    returning: true,
    transaction,
  });
  if (updatedCount !== 1) {
    throw new ServerError('cannot update mark on this offer');
  }
  return updatedRating.dataValues;
};

module.exports.createRating = async (data, transaction) => {
  const result = await db.Ratings.create(data, { transaction });
  if (!result) {
    throw new ServerError('cannot mark offer');
  } else {
    return result.get({ plain: true });
  }
};

module.exports.getQuery = (offerId, userId, mark, isFirst, transaction) => {
  const getCreateQuery = () =>
    module.exports.createRating({ offerId, mark, userId }, transaction);
  const getUpdateQuery = () =>
    module.exports.updateRating({ mark }, { offerId, userId }, transaction);
  return isFirst ? getCreateQuery : getUpdateQuery;
};
