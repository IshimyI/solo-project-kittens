"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Inventory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Shop }) {
      this.belongsTo(User, { foreignKey: "userId" });
      this.belongsTo(Shop, { foreignKey: "itemId" });
    }
  }
  Inventory.init(
    {
      userId: DataTypes.INTEGER,
      itemId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Inventory",
    }
  );
  return Inventory;
};
