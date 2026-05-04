'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Movimientos', 'fecha_final', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Movimientos', 'fecha_final', {
      type: Sequelize.DATEONLY,
      allowNull: true
    });
  }
};
