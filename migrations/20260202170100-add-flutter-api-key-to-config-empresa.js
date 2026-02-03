"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log("Adding flutter_api_key column to CONFIG_EMPRESA table...");

    await queryInterface.addColumn("CONFIG_EMPRESA", "flutter_api_key", {
      type: Sequelize.STRING(64),
      allowNull: true,
    });

    await queryInterface.addIndex("CONFIG_EMPRESA", ["flutter_api_key"], {
      name: "IX_CONFIG_EMPRESA_FLUTTER_API_KEY",
      unique: true,
      where: {
        flutter_api_key: {
          [Sequelize.Op.ne]: null,
        },
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "CONFIG_EMPRESA",
      "IX_CONFIG_EMPRESA_FLUTTER_API_KEY",
    );

    await queryInterface.removeColumn("CONFIG_EMPRESA", "flutter_api_key");
  },
};
