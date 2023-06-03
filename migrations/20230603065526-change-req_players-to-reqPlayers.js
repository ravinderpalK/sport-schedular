"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn("Sessions", "req_players", "reqPlayers");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Sessions", "reqPlayers", "req_players");
  },
};
