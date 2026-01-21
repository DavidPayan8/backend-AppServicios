"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.createTable("PushBrowsers", {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        endpoint: {
          type: Sequelize.STRING(1000),
          allowNull: false,
          unique: true,
        },
        p256dh: {
          type: Sequelize.TEXT,
          allowNull: false,
        },

        auth: {
          type: Sequelize.TEXT,
          allowNull: false,
        },

        isActive: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },

        id_usuario: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },

        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("GETDATE"),
        },

        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("GETDATE"),
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable("PushBrowsers");
  },
};
