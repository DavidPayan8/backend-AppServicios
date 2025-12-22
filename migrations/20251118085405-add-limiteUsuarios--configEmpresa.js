'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'config_empresa', // nombre de la tabla
      'limite_usuarios', // nombre del nuevo campo
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      }
    );
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn('config_empresa', 'limite_usuarios');
  }
};
