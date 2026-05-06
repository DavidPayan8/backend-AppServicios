'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Inmovilizado', 'id_empresa', {
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
    await queryInterface.removeColumn('Inmovilizado', 'id_empresa');
  }
};
