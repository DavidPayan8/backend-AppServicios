'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('INMOVILIZADO', 'id_empresa', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      references: {
        model: 'EMPRESA',
        key: 'id_empresa'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('INMOVILIZADO', 'id_empresa');
  }
};
