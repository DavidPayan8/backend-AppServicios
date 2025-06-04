const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const ORDEN_TRABAJO = sequelize.define(
    "ORDEN_TRABAJO",
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
        allowNull: false,
      },
      observaciones: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      id_cliente: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      es_ote: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      detalles: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      estado: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "pendiente",
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      id_servicio_origen: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      articulo_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      id_contrato: {
        type: DataTypes.INTEGER,
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
      fecha_inicio: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      fecha_fin: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "ORDEN_TRABAJO",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "pk_proyectos",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );

  ORDEN_TRABAJO.associate = (models) => {
    ORDEN_TRABAJO.belongsTo(models.EMPRESA, {
      foreignKey: "id_empresa",
      as: "empresa",
    });

    ORDEN_TRABAJO.belongsTo(models.USUARIOS, {
      foreignKey: "id_usuario",
      as: "usuario_ot",
    });

    ORDEN_TRABAJO.belongsTo(models.PROYECTOS, {
      foreignKey: "id_servicio_origen",
      as: "proyecto",
    });

    ORDEN_TRABAJO.hasOne(models.CABECERA, {
      foreignKey: "orden_trabajo_Id",
      as: "orden_trabajo_cabecera",
    });

    ORDEN_TRABAJO.belongsTo(models.CLIENTES, {
      foreignKey: "id_cliente",
      as: "cliente_ot",
    });

    ORDEN_TRABAJO.belongsTo(models.ARTICULOS, {
      foreignKey: "articulo_id",
      as: "articulo_ot",
    });

    ORDEN_TRABAJO.belongsTo(models.CONTRATO, {
      foreignKey: "id_contrato",
      as: "contrato",
    });

    ORDEN_TRABAJO.hasMany(models.PARTES_TRABAJO, {
      foreignKey: "id_proyecto",
      as: "partes_trabajo",
    });

    ORDEN_TRABAJO.hasOne(models.CALENDARIO, {
      foreignKey: "id_proyecto",
      as: "calendario",
    });
  };

  return ORDEN_TRABAJO;
};
