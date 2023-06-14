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
          isCanceledReason: "",
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

    static getUpcomingJoinedSessions(user) {
      const { Op } = require("sequelize");
      return this.findAll({
        where: {
          joinedPlayers: {
            [Op.contains]: [user],
          },
          date: {
            [Op.gt]: new Date().toISOString(),
          },
        },
      });
    }

    static getAllSession(sportId, months) {
      const { Op } = require("sequelize");
      let date1 = new Date(
        new Date().setMonth(new Date().getMonth() + parseInt(months))
      ).toISOString();
      let date2 = new Date().toISOString();
      if (date1 > date2) [date1, date2] = [date2, date1];
      return this.findAll({
        where: {
          sportId,
          date: {
            [Op.between]: [date1, date2],
          },
        },
      });
    }

    static getAllCanceledSession(sportId, months) {
      const { Op } = require("sequelize");
      let date1 = new Date(
        new Date().setMonth(new Date().getMonth() + parseInt(months))
      ).toISOString();
      let date2 = new Date().toISOString();
      if (date1 > date2) [date1, date2] = [date2, date1];
      return this.findAll({
        where: {
          sportId,
          date: {
            [Op.between]: [date1, date2],
          },
          isCanceledReason: {
            [Op.not]: "",
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

    static updateSessionPlayers(id, joinedPlayers, reqPlayers) {
      return this.update(
        { joinedPlayers, reqPlayers },
        {
          where: {
            id,
          },
        }
      );
    }

    static cancelSession(id, reason) {
      return this.update(
        { isCanceledReason: reason },
        {
          where: {
            id,
          },
        }
      );
    }

    static editSession(date, address, joinedPlayers, reqPlayers, id) {
      return this.update(
        {
          date,
          address,
          joinedPlayers,
          reqPlayers,
        },
        {
          where: {
            id,
          },
        }
      );
    }
    static deleteSessions(sportId) {
      return this.destroy({
        where: {
          sportId,
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
      isCanceledReason: {
        type: DataTypes.STRING,
        defaultValue: "",
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
