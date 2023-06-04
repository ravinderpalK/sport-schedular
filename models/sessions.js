"use strict";
const { Model, where } = require("sequelize");
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

    static getJoinedSessions(user) {
      const { Op } = require("sequelize");
      return this.findAll({
        where: {
          joinedPlayers: {
            [Op.contains]: [user],
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

    static cancelSession(id) {
      return this.destroy({
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
      joinedPlayers: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        validate: {
          isValidateEmail: function (value) {
            let emails = Array.isArray(value) ? value : [value];
            let regex = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");
            emails.forEach((email) => {
              if (!regex.test(email)) {
                throw new Error("Email not valid");
              }
            });
            return value;
          },
        },
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
