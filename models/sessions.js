"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Sessions extends Model {
    static associate(models) {
      Sessions.belongsTo(models.Sports, {
        foreignKey: "sportId",
      });
    }

    static addSession(
      date,
      address,
      players_name,
      req_players,
      organiser,
      sportId
    ) {
      return this.create({
        date,
        address,
        players_name,
        req_players,
        organiser,
        sportId,
      });
    }

    static getSportSessions(id) {
      return this.findAll({
        where: {
          sportId: id,
        },
      });
    }

    static getSession(id) {
      return this.findOne({
        where: {
          id,
        },
      });
    }
  }
  Sessions.init(
    {
      date: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isDate: true,
        },
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      players_name: {
        type: DataTypes.TEXT,
      },
      req_players: {
        type: DataTypes.INTEGER,
        validate: {
          notEmpty: true,
        },
      },
      organiser: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      sportId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Sports",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "Sessions",
    }
  );
  return Sessions;
};
