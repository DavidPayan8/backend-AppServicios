"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Agrega la restricción única sobre user_name
    await queryInterface.addConstraint("USUARIOS", {
      fields: ["user_name"],
      type: "unique",
      name: "UQ_USUARIOS_USERNAME",
    });
  },

  async down(queryInterface, Sequelize) {
    // Revierte la migración eliminando la restricción
    await queryInterface.removeConstraint("USUARIOS", "UQ_USUARIOS_USERNAME");
  },
};
