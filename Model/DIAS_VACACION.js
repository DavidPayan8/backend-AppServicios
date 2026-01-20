const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const DIAS_VACACION = sequelize.define(
    "DIAS_VACACION",
    {
      id_vacacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      dia: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        primaryKey: true,
      },
      estado: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "solicitado",
      },
    },
    {
      sequelize,
      tableName: "DIAS_VACACION",
      schema: "dbo",
      timestamps: false,
    }
  );

  DIAS_VACACION.associate = (models) => {
    DIAS_VACACION.belongsTo(models.VACACIONES, {
      foreignKey: "id_vacacion",
      targetKey: "id",
      as: "vacacion",
    });
  };

  return DIAS_VACACION;
};
