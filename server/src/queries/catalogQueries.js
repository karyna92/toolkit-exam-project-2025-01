const db = require('../models');

module.exports.createCatalogRecord = async (userId, catalogName) => {
  return await db.Catalog.create({ userId, catalogName });
};

module.exports.addChatToCatalog = async (catalogId, conversationId) => {
  if (!conversationId) return;
  await db.sequelize.models.CatalogChats.findOrCreate({
    where: { catalogId, conversationId },
  });
};

module.exports.getCatalogWithChats = async (catalogId) => {
  return await db.Catalog.findByPk(catalogId, {
    include: [
      {
        model: db.Conversations,
        through: { attributes: [] },
        attributes: ['id'],
      },
    ],
    attributes: ['id', 'catalogName'],
  });
};

module.exports.getUserCatalogs = async (userId) => {
  return await db.Catalog.findAll({
    where: { userId },
    include: [
      {
        model: db.Conversations,
        through: { attributes: [] },
        attributes: ['id'],
      },
    ],
    attributes: ['id', 'catalogName'],
  });
};

module.exports.updateCatalogName = async (userId, catalogId, catalogName) => {
  const [updated] = await db.Catalog.update(
    { catalogName },
    { where: { id: catalogId, userId } }
  );

  if (!updated) return null;
  const catalog = await db.Catalog.findByPk(catalogId, {
    include: [
      {
        model: db.Conversations,
        through: { attributes: [] },
        attributes: ['id'],
      },
    ],
    attributes: ['id', 'catalogName'],
  });

  return catalog;
};

module.exports.getUserCatalogById = async (userId, catalogId) => {
  return await db.Catalog.findOne({
    where: { id: catalogId, userId },
  });
};

module.exports.removeChatFromCatalog = async (catalogId, conversationId) => {
  return await db.sequelize.models.CatalogChats.destroy({
    where: { catalogId, conversationId },
  });
};
module.exports.deleteUserCatalog = async (userId, catalogId) => {
  return await db.Catalog.destroy({
    where: { id: catalogId, userId },
  });
};
