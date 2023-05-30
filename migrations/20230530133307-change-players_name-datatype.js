"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Sessions", "players_name", {
      type:
        Sequelize.ARRAY(Sequelize.STRING) +
        'USING CAST("players_name" as ' +
        Sequelize.ARRAY(Sequelize.STRING) +
        ")",
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Sessions", "players_name", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
