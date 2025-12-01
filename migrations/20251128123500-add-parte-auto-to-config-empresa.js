'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('config_empresa', 'parte_auto', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('config_empresa', 'parte_auto');
    }
};
