'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar columna si no existe
    const tableDescription = await queryInterface.describeTable('MOVIMIENTOS_INMOVILIZADO');

    if (!tableDescription.id_movimiento) {
      await queryInterface.addColumn('MOVIMIENTOS_INMOVILIZADO', 'id_movimiento', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Movimientos',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Remover columna si existe
    const tableDescription = await queryInterface.describeTable('MOVIMIENTOS_INMOVILIZADO');

    if (tableDescription.id_movimiento) {
      await queryInterface.removeColumn('MOVIMIENTOS_INMOVILIZADO', 'id_movimiento');
    }
  }
};
