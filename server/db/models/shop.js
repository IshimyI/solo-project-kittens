"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Shop extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Inventory, TypeOfCloth }) {
      this.belongsToMany(User, {
        foreignKey: "itemId",
        through: Inventory,
        as: "buyedByUser",
      });
      this.belongsTo(TypeOfCloth, { foreignKey: "typeId" });
    }
  }
  Shop.init(
    {
      name: DataTypes.STRING,
      price: DataTypes.INTEGER,
      path: DataTypes.STRING,
      typeId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Shop",
    }
  );
  return Shop;
};
