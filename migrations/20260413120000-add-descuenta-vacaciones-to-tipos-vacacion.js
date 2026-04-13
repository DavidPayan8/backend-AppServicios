'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      { tableName: 'TIPOS_VACACION', schema: 'dbo' },
      'descuenta_vacaciones',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      }
    );

    // Tipos de vacación que NO descuentan del saldo total
    await queryInterface.sequelize.query(`
      UPDATE dbo.TIPOS_VACACION
      SET descuenta_vacaciones = 0
      WHERE nombre IN ('Asuntos Propios', 'Otros', 'Cita Médico')
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      { tableName: 'TIPOS_VACACION', schema: 'dbo' },
      'descuenta_vacaciones'
    );
  },
};
