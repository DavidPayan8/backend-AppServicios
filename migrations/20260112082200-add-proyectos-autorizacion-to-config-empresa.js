"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log(
        "Adding proyectos_autorizacion column to CONFIG_EMPRESA table..."
      );
      await queryInterface.addColumn(
        "CONFIG_EMPRESA",
        "proyectos_autorizacion",
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        }
      );
      console.log("✓ projects_authorization column added successfully");
    } catch (error) {
      console.error("✗ Error adding column:", error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      console.log(
        "Removing proyectos_autorizacion column from CONFIG_EMPRESA table..."
      );
      await queryInterface.removeColumn(
        "CONFIG_EMPRESA",
        "proyectos_autorizacion"
      );
      console.log("✓ projects_authorization column removed successfully");
    } catch (error) {
      console.error("✗ Error removing column:", error.message);
      throw error;
    }
  },
};
