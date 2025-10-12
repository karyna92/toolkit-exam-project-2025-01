module.exports = (sequelize, DataTypes) => {
  const ConversationToParticipants = sequelize.define(
    'ConversationToParticipants',
    {
      conversationId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: 'Conversations', key: 'id' },
        onDelete: 'CASCADE',
      },
      userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
      },
      blackList: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      favoriteList: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'ConversationToParticipants',
      timestamps: false,
    }
  );

  ConversationToParticipants.associate = function (models) {
    ConversationToParticipants.belongsTo(models.Conversations, {
      foreignKey: 'conversationId',
    });
    ConversationToParticipants.belongsTo(models.Users, {
      foreignKey: 'userId',
    });
  };

  return ConversationToParticipants;
};
