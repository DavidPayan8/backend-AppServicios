'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Movimientos', {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_origen: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      fecha_inicio: {
        type: Sequelize.DATE,
        allowNull: false
      },
      fecha_final: {
        type: Sequelize.DATE,
        allowNull: true
      },
      nombreTrabajador: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      Observaciones: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      estado_traspaso: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      Ubicacion: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Movimientos');
  }
};
