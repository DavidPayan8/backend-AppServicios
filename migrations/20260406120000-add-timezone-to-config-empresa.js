'use strict';
//IMPORTANTE: ESTA MIGRACION CREA LA COLUMNA timezone EN LA TABLA config_empresa
// Aunque se puede ejecutar para crerla, en principio he modificado la base de datos
// de prueba directamente en SQL Server, en producción mejor ejecutar la migración.



/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'config_empresa' AND COLUMN_NAME = 'timezone'
      )
      BEGIN
        ALTER TABLE config_empresa ADD timezone VARCHAR(50) NOT NULL DEFAULT 'Europe/Madrid'
      END
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      IF EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'config_empresa' AND COLUMN_NAME = 'timezone'
      )
      BEGIN
        ALTER TABLE config_empresa DROP COLUMN timezone
      END
    `);
  }
};
