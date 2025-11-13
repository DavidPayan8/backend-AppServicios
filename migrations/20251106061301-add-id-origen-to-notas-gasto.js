'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('notas_gasto', 'id_origen', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'id'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('notas_gasto', 'id_origen');
  }
};


