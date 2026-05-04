const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const MOVIMIENTOS = sequelize.define(
    "MOVIMIENTOS",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      id_origen: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fecha_inicio: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      fecha_final: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      nombreTrabajador: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      Observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      estado_traspaso: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      Ubicacion: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "Movimientos",
      schema: "dbo",
      timestamps: true,
      indexes: [
        {
          name: "pk_movimientos",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );

  MOVIMIENTOS.associate = (models) => {
    MOVIMIENTOS.hasMany(models.MOVIMIENTOS_INMOVILIZADO, {
      foreignKey: "id_movimiento",
      as: "inmovilizados",
    });
  };

  return MOVIMIENTOS;
};
