"use strict";

const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1) Ampliar columna contrasena para almacenar hashes bcrypt (60 chars)
    await queryInterface.changeColumn(
      { tableName: "USUARIOS", schema: "dbo" },
      "contrasena",
      {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
    );

    // 2) Obtener todos los usuarios con contraseñas en texto plano
    const [usuarios] = await queryInterface.sequelize.query(
      `SELECT id, contrasena FROM dbo.USUARIOS`,
    );

    // 3) Hashear cada contraseña y actualizar
    for (const usuario of usuarios) {
      // Si ya es un hash bcrypt, saltar (por si se ejecuta dos veces)
      if (usuario.contrasena.startsWith("$2b$") || usuario.contrasena.startsWith("$2a$")) {
        continue;
      }

      const hash = await bcrypt.hash(usuario.contrasena, SALT_ROUNDS);
      await queryInterface.sequelize.query(
        `UPDATE dbo.USUARIOS SET contrasena = :hash WHERE id = :id`,
        {
          replacements: { hash, id: usuario.id },
        },
      );
    }

    console.log(`Migración completada: ${usuarios.length} contraseñas procesadas.`);
  },

  async down(queryInterface, Sequelize) {
    // No se puede revertir un hash - solo revertimos el tamaño de columna
    // Las contraseñas hasheadas NO se pueden deshacer
    console.log(
      "ADVERTENCIA: Las contraseñas hasheadas no se pueden revertir a texto plano.",
    );

    await queryInterface.changeColumn(
      { tableName: "USUARIOS", schema: "dbo" },
      "contrasena",
      {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
    );
  },
};
