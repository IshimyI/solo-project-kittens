"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Shop extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Inventory, TypeOfCloth, User_selected_items }) {
      this.belongsToMany(User, {
        foreignKey: "itemId",
        through: Inventory,
        as: "buyedByUser",
      });
      this.belongsTo(TypeOfCloth, { foreignKey: "typeId" });

      this.hasMany(User_selected_items, {
        foreignKey: "hatId",
        as: "selectedAsHat",
      });

      this.hasMany(User_selected_items, {
        foreignKey: "bodyId",
        as: "selectedAsBody",
      });

      this.hasMany(User_selected_items, {
        foreignKey: "coatId",
        as: "selectedAsCoat",
      });
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
