'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Nominas', {
      Id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      IdUsuario: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      ambito: {
        type: Sequelize.STRING(50)
      },
      tipo: {
        type: Sequelize.STRING(50)
      },
      nombreOriginal: {
        type: Sequelize.STRING(255)  // ← AÑADIDO
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Nominas');
  }
};
