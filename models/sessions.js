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
      joinedPlayers,
      reqPlayers,
      organiser,
      sportId
    ) {
      return this.create({
        date,
        address,
        joinedPlayers,
        reqPlayers,
        organiser,
        sportId,
      });
    }

    static getUpcomingSportSessions(id) {
      const { Op } = require("sequelize");
      return this.findAll({
        where: {
          sportId: id,
          date: {
            [Op.gt]: new Date().toISOString(),
          },
        },
      });
    }

    static getPreviousSportSessions(id) {
      const { Op } = require("sequelize");
      return this.findAll({
        where: {
          sportId: id,
          date: {
            [Op.lt]: new Date().toISOString(),
          },
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

    static updateSession(id, joinedPlayers, reqPlayers) {
      return this.update(
        { joinedPlayers, reqPlayers },
        {
          where: {
            id,
          },
        }
      );
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
      joinedPlayers: {
        type: DataTypes.ARRAY(DataTypes.STRING),
      },
      reqPlayers: {
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
          isEmail: true,
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
