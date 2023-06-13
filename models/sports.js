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
    static updateSportName(name, id) {
      return this.update(
        { name },
        {
          where: {
            id,
          },
        }
      );
    }
    static removeSport(id) {
      return this.destroy({
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
        primaryKey: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "Sports",
    }
  );
  return Sports;
};
