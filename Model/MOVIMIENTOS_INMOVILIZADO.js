const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const MOVIMIENTOS_INMOVILIZADO = sequelize.define(
    "MOVIMIENTOS_INMOVILIZADO",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      id_inmovilizado: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "INMOVILIZADO",
          key: "id",
        },
      },
      id_trabajador: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Usuarios",
          key: "id",
        },
      },
    },
    {
      sequelize,
      tableName: "Movimientos_Inmovilizado",
      schema: "dbo",
      timestamps: true,
      indexes: [
        {
          name: "pk_movimientos_inmovilizado",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );

  MOVIMIENTOS_INMOVILIZADO.associate = (models) => {
    MOVIMIENTOS_INMOVILIZADO.belongsTo(models.INMOVILIZADO, {
      foreignKey: "id_inmovilizado",
      as: "inmovilizado",
    });

    MOVIMIENTOS_INMOVILIZADO.belongsTo(models.USUARIOS, {
      foreignKey: "id_trabajador",
      as: "trabajador",
    });
  };

  return MOVIMIENTOS_INMOVILIZADO;
};
