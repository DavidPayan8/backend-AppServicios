"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log("Creando tabla Personal_Autorizado_Proyecto...");

      // Crear la tabla
      await queryInterface.createTable("Personal_Autorizado_Proyecto", {
        id: {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        Personal_Id: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        Proyecto_Id: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        Autorizado_Id: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        Fecha_Autorizacion: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        Activo: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      });

      console.log("✓ Tabla creada. Creando índices...");

      // Crear índices
      await queryInterface.addIndex(
        "Personal_Autorizado_Proyecto",
        ["Personal_Id", "Proyecto_Id"],
        {
          name: "IX_Personal_Proyecto",
          unique: true,
        }
      );

      await queryInterface.addIndex(
        "Personal_Autorizado_Proyecto",
        ["Proyecto_Id"],
        {
          name: "IX_Proyecto",
        }
      );

      await queryInterface.addIndex(
        "Personal_Autorizado_Proyecto",
        ["Autorizado_Id"],
        {
          name: "IX_Autorizado",
        }
      );

      await queryInterface.addIndex(
        "Personal_Autorizado_Proyecto",
        ["Activo"],
        {
          name: "IX_Activo",
        }
      );
      console.log("✓✓ Tabla Personal_Autorizado_Proyecto creada completamente");
    } catch (error) {
      console.error("✗ Error en migración:", error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      console.log("Eliminando tabla Personal_Autorizado_Proyecto...");
      await queryInterface.dropTable("Personal_Autorizado_Proyecto");
      console.log("✓ Tabla eliminada");
    } catch (error) {
      console.error("✗ Error eliminando tabla:", error.message);
      throw error;
    }
  },
};
