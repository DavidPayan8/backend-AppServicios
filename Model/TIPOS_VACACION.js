const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const TIPOS_VACACION = sequelize.define(
    "TIPOS_VACACION",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      cantidad_dias: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      es_dias_naturales: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      id_empresa: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "TIPOS_VACACION",
      schema: "dbo",
      timestamps: false,
    }
  );

  TIPOS_VACACION.associate = (models) => {
    TIPOS_VACACION.belongsTo(models.EMPRESA, {
      foreignKey: "id_empresa",
      as: "empresa",
    });

    TIPOS_VACACION.hasOne(models.VACACIONES, {
      foreignKey: "tipo",
      as: "tipo_vacaciones",
    });
  };

  return TIPOS_VACACION;
};
