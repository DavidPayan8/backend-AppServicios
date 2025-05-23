const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const NOTIFICACION = sequelize.define(
    "NOTIFICACIONES",
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
      asunto: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      cuerpo: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      fecha_emision: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      prioridad: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      id_empresa: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      id_emisor: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      tipo_notificacion: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "mensaje",
      },
    },
    {
      sequelize,
      tableName: "NOTIFICACIONES",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "PK__NOTIFICA__3213E83F5E595C56",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );

  NOTIFICACION.associate = (models) => {
    NOTIFICACION.belongsTo(models.EMPRESA, {
      foreignKey: "id_empresa",
      as: "empresa",
    });

    NOTIFICACION.belongsTo(models.USUARIOS, {
      foreignKey: "id_emisor",
      as: "emisor",
    });

    NOTIFICACION.hasMany(models.NOTIFICACIONES_USUARIOS, {
      foreignKey: 'id_usuario',
      as: 'notificacion_usuario',
    });
  };

  return NOTIFICACION;
};
