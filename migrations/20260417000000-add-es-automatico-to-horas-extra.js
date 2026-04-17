'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si la columna ya existe antes de añadirla
    await queryInterface.sequelize.query(`
      IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'horas_extra' AND COLUMN_NAME = 'es_automatico'
      )
      BEGIN
        ALTER TABLE horas_extra
        ADD es_automatico BIT DEFAULT 0;
      END
    `);
  },

  async down(queryInterface, Sequelize) {
    // Verificar si la columna existe antes de eliminarla
    await queryInterface.sequelize.query(`
      IF EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'horas_extra' AND COLUMN_NAME = 'es_automatico'
      )
      BEGIN
        ALTER TABLE horas_extra
        DROP COLUMN es_automatico;
      END
    `);
  }
};
