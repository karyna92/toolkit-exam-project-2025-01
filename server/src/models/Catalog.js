module.exports = (sequelize, DataTypes) => {
  const Catalog = sequelize.define(
    'Catalog',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      catalogName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
    },
    {
      tableName: 'Catalogs',
      timestamps: true,
    }
  );

  Catalog.associate = function (models) {
    Catalog.belongsTo(models.Users, { foreignKey: 'userId' });
    Catalog.belongsToMany(models.Conversations, {
      through: 'CatalogChats',
      foreignKey: 'catalogId',
      otherKey: 'conversationId',
    });
  };

  return Catalog;
};
