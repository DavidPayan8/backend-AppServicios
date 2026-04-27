'use strict';
//IMPORTANTE: ESTA MIGRACION CREA LA COLUMNA timezone EN LA TABLA config_empresa
// Aunque se puede ejecutar para crerla, en principio he modificado la base de datos
// de prueba directamente en SQL Server, en producción mejor ejecutar la migración.



/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('config_empresa', 'timezone', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'Europe/Madrid'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('config_empresa', 'timezone');
  }
};
