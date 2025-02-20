"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate({ Shop, Inventory, User_selected_items }) {
      this.belongsToMany(Shop, {
        foreignKey: "userId",
        through: Inventory,
        as: "buyedItem",
      });

      this.hasMany(User_selected_items, {
        foreignKey: "userId",
        as: "selectedItems",
      });
    }
  }

  User.init(
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      coins: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
