const db = require('../models/postgresModels');
const CONSTANTS = require('../constants');

module.exports.createWhereForAllContests = (
  typeIndex,
  contestId,
  industry,
  awardSort
) => {
  const object = {
    where: {},
    order: [],
  };

  const idx = typeIndex ? Number(typeIndex) : undefined;
  if (idx && types[idx]) {
    Object.assign(object.where, { contestType: getPredicateTypes(idx) });
  }

  if (contestId) {
    const id = Number(contestId);
    if (!isNaN(id)) Object.assign(object.where, { id });
  }

  if (industry) {
    object.where.industry = industry;
  }

  if (awardSort && ['asc', 'desc'].includes(awardSort.toLowerCase())) {
    object.order.push(['prize', awardSort.toLowerCase()]);
  }

  object.where.status = {
    [db.Sequelize.Op.or]: [
      CONSTANTS.CONTEST_STATUS_FINISHED,
      CONSTANTS.CONTEST_STATUS_ACTIVE,
    ],
  };

  object.order.push(['id', 'desc']);
  return object;
};

function getPredicateTypes(index) {
  return { [db.Sequelize.Op.or]: types[index].split(',') };
}

const types = [
  '',
  'name,tagline,logo',
  'name',
  'tagline',
  'logo',
  'name,tagline',
  'logo,tagline',
  'name,logo',
];
