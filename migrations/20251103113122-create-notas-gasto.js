'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notas_gasto', {
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
      departamento: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      proyecto: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      fechaSolicitud: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.literal('GETDATE()')
      },
      lineasGasto: {
        type: Sequelize.TEXT, // SQL Server no soporta JSON nativo
        allowNull: false,
        defaultValue: '[]'
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      estado: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'borrador'
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      aprobadoPor: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      fechaAprobacion: {
        type: Sequelize.DATE,
        allowNull: true
      },
      motivoRechazo: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      rechazadoPor: {
        type: Sequelize.STRING(100),
        allowNull: true
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
    await queryInterface.addIndex('notas_gasto', ['empleado']);
    await queryInterface.addIndex('notas_gasto', ['departamento']);
    await queryInterface.addIndex('notas_gasto', ['estado']);
    await queryInterface.addIndex('notas_gasto', ['fechaSolicitud']);

    // Restricción CHECK para validar estado
    await queryInterface.sequelize.query(`
      ALTER TABLE notas_gasto
      ADD CONSTRAINT CK_notas_gasto_estado
      CHECK (estado IN ('borrador', 'pendiente', 'aprobada', 'rechazada'));
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('notas_gasto');
  }
};
