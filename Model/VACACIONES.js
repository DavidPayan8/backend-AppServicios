const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const VACACIONES = sequelize.define(
    "VACACIONES",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      aceptado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      tipo: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "VACACIONES",
      schema: "dbo",
      timestamps: false,
    }
  );
  VACACIONES.associate = (models) => {
    VACACIONES.belongsTo(models.USUARIOS, {
      foreignKey: "id_usuario",
      as: "usuario",
    });

    VACACIONES.belongsTo(models.TIPOS_VACACION, {
      foreignKey: "tipo",
      as: "tipo_vacaciones",
    });

    VACACIONES.hasMany(models.DIAS_VACACION, {
      foreignKey: "id_vacacion",
      sourceKey: "id",
      as: "dias_vacacion",
    });

    VACACIONES.hasMany(models.VACACIONES_ESTADOS, {
      foreignKey: "id_vacacion",
      sourceKey: "id",
      as: "vacaciones_estado",
    });
  };

  return VACACIONES;
};
