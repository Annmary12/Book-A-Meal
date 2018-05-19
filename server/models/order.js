
/**
 * @model
 * @param  {object} sequelize - Sequelize DB connection object
 * @param  {object} Datatypes - Sequelize Datatypes
 * @return {object} Sequelize Model
 */
const order = (sequelize, DataTypes) => {
  const Order = sequelize.define('order', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    userId: DataTypes.UUID,
    mealId: DataTypes.UUID,
    quantity: DataTypes.INTEGER,
    status: DataTypes.ENUM('pending','delivered','cancelled'),
    deliveryAddress: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    paranoid: true,
    defaultScope: {
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    },
  });

  Order.prototype.toJSON = function () {
    const values = {...this.get()};

    delete values.createdAt;
    delete values.updatedAt;
    delete values.deletedAt;
    
    return values;
  }

  Order.associate = (models) => {
    Order.belongsToMany(models.user, {
      through: {
        model: models.meal
      },
      as: 'catererOrders',
      foreignKey: 'userId'
    });
  };
  return Order;
};

export default order;
