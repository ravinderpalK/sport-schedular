"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Sessions", "isCanceledReason", {
      type: Sequelize.STRING,
      defaultValue: "",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Sessions", "isCanceledReason");
  },
};
