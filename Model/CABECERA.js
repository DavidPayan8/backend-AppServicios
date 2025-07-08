const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const CABECERA = sequelize.define(
    "CABECERA",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      fecha: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      numero: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      entidad_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      base: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      tipo_IVA: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      orden_trabajo_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      id_Servicio_origen: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      id_origen: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      serie: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      id_empresa: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      actualizar: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: "CABECERA",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "PK__CABECERA__3213E83F9FBE9997",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );

  CABECERA.associate = (models) => {
    CABECERA.belongsTo(models.EMPRESA, {
      foreignKey: "id_empresa",
      as: "usuarios",
    });

    CABECERA.belongsTo(models.CLIENTES, {
      foreignKey: "entidad_id",
      as: "clientes",
    });

    CABECERA.belongsTo(models.ORDEN_TRABAJO, {
      foreignKey: "orden_trabajo_id",
      as: "orden_trabajo",
    });

    CABECERA.belongsTo(models.PROYECTOS, {
      foreignKey: "id_Servicio_origen",
      as: "proyectos",
    });

    CABECERA.hasMany(models.DETALLES_DOC, {
      foreignKey: "cabecera_id",
      as: "cabecera",
    });

    CABECERA.hasMany(models.COBROS_DOC, {
      foreignKey: "cabecera_id",
      as: "cobros",
    });
  };
  return CABECERA;
};
