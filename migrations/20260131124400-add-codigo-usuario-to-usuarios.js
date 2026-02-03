"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Añadir la columna
    await queryInterface.addColumn("USUARIOS", "codigo_usuario", {
      type: Sequelize.STRING(100),
      allowNull: true,
    });

    // Crear índice único solo sobre valores no nulos
    await queryInterface.addIndex("USUARIOS", ["codigo_usuario"], {
      name: "IX_USUARIOS_CODIGO_USUARIO",
      unique: true,
      where: {
        codigo_usuario: {
          [Sequelize.Op.ne]: null,
        },
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // Eliminar índice primero
    await queryInterface.removeIndex("USUARIOS", "IX_USUARIOS_CODIGO_USUARIO");
    // Luego eliminar columna
    await queryInterface.removeColumn("USUARIOS", "codigo_usuario");
  },
};
