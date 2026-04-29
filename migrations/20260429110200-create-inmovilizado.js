'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Inmovilizado', {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      Codigo: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      Estado: {
        type: Sequelize.ENUM('Alta', 'Baja'),
        defaultValue: 'Alta',
        allowNull: false
      },
      Fecha_alta: {
        type: Sequelize.DATE,
        allowNull: false
      },
      Fecha_baja: {
        type: Sequelize.DATE,
        allowNull: true
      },
      info_general: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      id_origen: {
        type: Sequelize.INTEGER,
        allowNull: false
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
    await queryInterface.dropTable('Inmovilizado');
  }
};
