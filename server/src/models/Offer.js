module.exports = (sequelize, DataTypes) => {
  const Offer = sequelize.define(
    'Offers',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      contestId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      text: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fileName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      originalFileName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          'pending',
          'approved',
          'won',
          'rejected',
          'declined'
        ),
        allowNull: true,
        defaultValue: 'pending',
      },
    },
    {
      timestamps: true,
    }
  );

  Offer.associate = function (models) {
    Offer.belongsTo(models.Users, { foreignKey: 'userId', targetKey: 'id' });
    Offer.belongsTo(models.Contests, {
      foreignKey: 'contestId',
      targetKey: 'id',
    });
    Offer.hasOne(models.Ratings, { foreignKey: 'offerId' });
  };

  return Offer;
};
