const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const CLIENTES = sequelize.define(
    "CLIENTES",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      id_origen: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      nombre: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      apellidos: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      nombre_empresa: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      direccion: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      id_empresa: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "CLIENTES",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "pk_clientes",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );
  CLIENTES.associate = (models) => {
    CLIENTES.belongsTo(models.EMPRESA, {
      foreignKey: "id_empresa",
      as: "usuarios",
    });

    CLIENTES.hasMany(models.CONTRATO, {
      foreignKey: "ID_cliente",
      as: "contrato",
    });

    CLIENTES.hasMany(models.ORDEN_TRABAJO, {
      foreignKey: "id_cliente",
      as: "cliente_ot",
    });

    CLIENTES.hasMany(models.PROYECTOS, {
      foreignKey: "id_cliente",
      as: "cliente_proyecto",
    });

    CLIENTES.hasMany(models.CABECERA, {
      foreignKey: "entidad_id",
      as: "cabecera",
    });
  };

  return CLIENTES;
};
