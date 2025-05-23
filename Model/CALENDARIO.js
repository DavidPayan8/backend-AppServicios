const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const CALENDARIO = sequelize.define(
    "CALENDARIO",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      hora_inicio: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      hora_fin: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      id_proyecto: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_origen: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "CALENDARIO",
      schema: "dbo",
      timestamps: false,
    }
  );

  CALENDARIO.associate = (models) => {
    CALENDARIO.belongsTo(models.USUARIOS, {
      foreignKey: "id_usuario",
      as: "usuarios",
    });

    CALENDARIO.belongsTo(models.ORDEN_TRABAJO, {
      foreignKey: "id_proyecto",
      as: "orden_trabajo",
    });
  };

  return CALENDARIO;
};
