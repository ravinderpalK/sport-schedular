"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Sports extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Sports.hasMany(models.Sessions, {
        foreignKey: "sportId",
      });
    }
    static addSport(name) {
      return Sports.create({
        name,
      });
    }
    static getSports() {
      return Sports.findAll();
    }
  }
  Sports.init(
    {
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
    },
    {
      sequelize,
      modelName: "Sports",
    }
  );
  return Sports;
};
