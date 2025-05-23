const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const PROYECTOS = sequelize.define(
    "PROYECTOS",
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
      codigo_proyecto: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      fecha_alta: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.fn("getdate"),
      },
      id_cliente: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      id_empresa: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "PROYECTOS",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "PK__PROYECTO__3213E83F99B3C6E7",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );
  PROYECTOS.associate = (models) => {
    PROYECTOS.belongsTo(models.EMPRESA, {
      foreignKey: "id_empresa",
      as: "empresa",
    });

    PROYECTOS.hasMany(models.ORDEN_TRABAJO, {
      foreignKey: "id_servicio_origen",
      as: "proyecto_ot",
    });

    PROYECTOS.hasMany(models.CONTRATO, {
      foreignKey: "id_servicio_origen",
      as: "proyecto_contrato",
    });

    PROYECTOS.belongsTo(models.CLIENTES, {
      foreignKey: "id_cliente",
      as: "cliente_proyecto",
    });
  };

  return PROYECTOS;
};
