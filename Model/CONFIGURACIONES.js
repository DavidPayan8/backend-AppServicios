const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const CONFIGURACIONES = sequelize.define(
    "CONFIGURACIONES",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      rol: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      n_dias_editables: {
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
      tableName: "CONFIGURACIONES",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "pk_configuraciones",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );

  CONFIGURACIONES.associate = (models) => {
    CONFIGURACIONES.belongsTo(models.EMPRESA, {
      foreignKey: "id_empresa",
      as: "empresa",
    });
  };

  return CONFIGURACIONES;
};
