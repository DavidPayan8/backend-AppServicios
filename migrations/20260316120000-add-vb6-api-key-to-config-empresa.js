"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log("Adding vb6_api_key column to CONFIG_EMPRESA table...");

    await queryInterface.addColumn("CONFIG_EMPRESA", "vb6_api_key", {
      type: Sequelize.STRING(64),
      allowNull: true,
    });

    await queryInterface.addIndex("CONFIG_EMPRESA", ["vb6_api_key"], {
      name: "IX_CONFIG_EMPRESA_VB6_API_KEY",
      unique: true,
      where: {
        vb6_api_key: {
          [Sequelize.Op.ne]: null,
        },
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "CONFIG_EMPRESA",
      "IX_CONFIG_EMPRESA_VB6_API_KEY",
    );

    await queryInterface.removeColumn("CONFIG_EMPRESA", "vb6_api_key");
  },
};
