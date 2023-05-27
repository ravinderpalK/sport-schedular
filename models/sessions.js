"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Sessions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Sessions.belongsTo(models.Sports, {
        foreignKey: "sportId",
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
