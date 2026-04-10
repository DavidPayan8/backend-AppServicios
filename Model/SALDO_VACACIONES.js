const Sequelize = require("sequelize");
  module.exports = function (sequelize, DataTypes) {
    const SALDO_VACACIONES = sequelize.define(
      "SALDO_VACACIONES",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        id_usuario: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        tipo: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        cantidad_dias: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "SALDO_VACACIONES",
        schema: "dbo",
        timestamps: false,
      }
    );

    return SALDO_VACACIONES;
  };