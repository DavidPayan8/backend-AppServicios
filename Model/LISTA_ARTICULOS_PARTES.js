const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('LISTA_ARTICULOS_PARTES', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_articulo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_proyecto: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'LISTA_ARTICULOS_PARTES',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "pk_lista_articulos_partes",
        unique: true,
        fields: [
          { name: "id" },
          { name: "id_articulo" },
        ]
      },
    ]
  });
};
