'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si la tabla ya existe
    const tableExists = await queryInterface.tableExists('horas_extra');

    if (tableExists) {
      console.log('Tabla horas_extra ya existe, saltando creación');
      return;
    }

    await queryInterface.createTable('horas_extra', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      empleado: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      id_empresa: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      horaInicio: {
        type: Sequelize.STRING(5),
        allowNull: false
      },
      horaFin: {
        type: Sequelize.STRING(5),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      duracionMinutos: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      fechaCreacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('GETDATE()')
      },
      fechaActualizacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('GETDATE()')
      }
    });

    // Índices
    await queryInterface.addIndex('horas_extra', ['empleado']);
    await queryInterface.addIndex('horas_extra', ['fecha']);
  },

  async down(queryInterface, Sequelize) {
    // Verificar si la tabla existe antes de dropearla
    const tableExists = await queryInterface.tableExists('horas_extra');

    if (tableExists) {
      await queryInterface.dropTable('horas_extra');
    }
  }
};
