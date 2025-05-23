const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('PARTES_MATERIALES', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_proyecto: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_capitulo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_partida: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'PARTES_MATERIALES',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "pk_partes_materiales",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
