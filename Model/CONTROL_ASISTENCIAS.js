const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const CONTROL_ASISTENCIAS = sequelize.define(
    "CONTROL_ASISTENCIAS",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      hora_entrada: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      hora_salida: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      fecha: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      id_origen: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      localizacion_entrada: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      localizacion_salida: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      estado_traspaso: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: "CONTROL_ASISTENCIAS",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "pk_control_asistencias",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );

  CONTROL_ASISTENCIAS.associate = (models) => {
    CONTROL_ASISTENCIAS.belongsTo(models.USUARIOS, {
      foreignKey: "id_usuario",
      as: "usuario",
    });
  };

  return CONTROL_ASISTENCIAS;
};
