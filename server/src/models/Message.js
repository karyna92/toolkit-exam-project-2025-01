module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define(
    'Messages',
    {
      conversationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Conversations',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: 'Messages',
      timestamps: true,
    }
  );

  Message.associate = function (models) {
    Message.belongsTo(models.Users, { foreignKey: 'senderId' });
    Message.belongsTo(models.Conversations, { foreignKey: 'conversationId' });
  };

  return Message;
};
