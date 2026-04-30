'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar columna si no existe
    const tableDescription = await queryInterface.describeTable('Movimientos_Inmovilizado');

    if (!tableDescription.id_movimiento) {
      await queryInterface.addColumn('Movimientos_Inmovilizado', 'id_movimiento', {
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
    const tableDescription = await queryInterface.describeTable('Movimientos_Inmovilizado');

    if (tableDescription.id_movimiento) {
      await queryInterface.removeColumn('Movimientos_Inmovilizado', 'id_movimiento');
    }
  }
};
