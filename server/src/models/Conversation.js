module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define(
    'Conversations',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
    },
    {
      tableName: 'Conversations',
      timestamps: true,
    }
  );

  Conversation.associate = function (models) {
    Conversation.belongsToMany(models.Users, {
      through: models.ConversationToParticipants,
      foreignKey: 'conversationId',
      otherKey: 'userId',
      as: 'participants',
    });
    Conversation.hasMany(models.Messages, {
      foreignKey: 'conversationId',
      as: 'messages',
    });
    Conversation.belongsToMany(models.Catalog, {
      through: 'CatalogChats',
      foreignKey: 'conversationId',
      otherKey: 'catalogId',
    });
  };

  return Conversation;
};
