"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {
      // define association here
    }
    static addUser(firstName, lastName, email, password, role = "user") {
      return this.create({
        firstName,
        lastName,
        email,
        password,
        role,
      });
    }
    static getUser(email) {
      return this.findOne({
        where: {
          email,
        },
      });
    }
  }
  Users.init(
    {
      firstName: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true,
        },
      },
      lastName: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true,
        },
      },
      role: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true,
        },
      },
    },
    {
      sequelize,
      modelName: "Users",
    }
  );
  return Users;
};
