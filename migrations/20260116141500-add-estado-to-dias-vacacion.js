"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("DIAS_VACACION", "estado", {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: "solicitado",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("DIAS_VACACION", "estado");
  },
};
