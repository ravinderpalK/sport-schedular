"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Sports extends Model {
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
    static getAllSports() {
      return Sports.findAll();
    }
    static getSport(id) {
      return this.findOne({
        where: {
          id,
        },
      });
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
