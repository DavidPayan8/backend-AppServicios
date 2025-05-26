const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('VEHICULOS', {
    ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    id_origen: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Nombre: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    Descripcion: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    Activo: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    id_empresa: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'VEHICULOS',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__VEHICULO__3214EC27185CBB5D",
        unique: true,
        fields: [
          { name: "ID" },
        ]
      },
    ]
  });
};
