const Sequelize = require("sequelize");

module.exports = function (sequelize, DataTypes) {
  const PETICIONARIO = sequelize.define(
    "PETICIONARIO",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      cliente_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "CLIENTES",
          key: "id",
        },
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      cargo: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      telefono_1: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      telefono_2: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "PETICIONARIO",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "PK_PETICIONARIO_ID",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );

  PETICIONARIO.associate = (models) => {
    PETICIONARIO.belongsTo(models.CLIENTES, {
      as: "peticionario_cliente",
      foreignKey: "cliente_id",
    });

    PETICIONARIO.hasMany(models.SOLICITUD, {
      as: "peticionario_solicitudes",
      foreignKey: "peticionario_id",
    });
  };

  return PETICIONARIO;
};
