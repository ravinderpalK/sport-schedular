"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      "Sessions",
      "players_name",
      "joinedPlayers"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      "Sessions",
      "joinedPlayers",
      "players_name"
    );
  },
};
