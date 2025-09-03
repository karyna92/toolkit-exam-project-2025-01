const db = require('../models/postgresModels');
const { BankDeclineError } = require('../errors');

module.exports.updateBankBalance = async (data, predicate, transaction) => {
  const [updatedCount, [updatedBank]] = await db.Banks.update(data, {
    where: predicate,
    returning: true,
    transaction,
  });
  if (updatedCount < 2) {
    throw new BankDeclineError('Bank decline transaction');
  }
};
