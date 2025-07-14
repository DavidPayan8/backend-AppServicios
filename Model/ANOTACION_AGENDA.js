const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const ANOTACION_AGENDA = sequelize.define(
    "ANOTACION_AGENDA",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_empresa: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_origen: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fecha_hora_anotacion: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      duracion_estimada: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      asunto: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      expediente_asociado: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      objetivo_anotacion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },

    {
      sequelize,
      tableName: "ANOTACION_AGENDA",
      schema: "dbo",
      timestamps: false,
    }
  );
  ANOTACION_AGENDA.associate = (models) => {
    ANOTACION_AGENDA.belongsTo(models.USUARIOS, {
      foreignKey: "usuario_id",
      as: "usuario",
    });
    ANOTACION_AGENDA.belongsTo(models.EMPRESA, {
      foreignKey: "id_empresa",
      as: "empresa",
    });
  };

  return ANOTACION_AGENDA;
};
