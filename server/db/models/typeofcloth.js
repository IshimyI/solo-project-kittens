"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TypeOfCloth extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Shop }) {
      this.hasMany(Shop, { foreignKey: "typeId" });
    }
  }
  TypeOfCloth.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "TypeOfCloth",
    }
  );
  return TypeOfCloth;
};
