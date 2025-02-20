"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User_selected_items extends Model {
    static associate({ User, Shop }) {
      this.belongsTo(User, {
        foreignKey: "userId",
        as: "user",
      });

      this.belongsTo(Shop, {
        foreignKey: "hatId",
        as: "hat",
      });

      this.belongsTo(Shop, {
        foreignKey: "bodyId",
        as: "body",
      });

      this.belongsTo(Shop, {
        foreignKey: "coatId",
        as: "coat",
      });
    }
  }

  User_selected_items.init(
    {
      userId: DataTypes.INTEGER,
      hatId: DataTypes.INTEGER,
      bodyId: DataTypes.INTEGER,
      coatId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "User_selected_items",
    }
  );

  return User_selected_items;
};
