'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Inmovilizado', 'tipo_inmovilizado_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'TipoInmovilizado',
        key: 'id'
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Inmovilizado', 'tipo_inmovilizado_id');
  }
};
