const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('CAPITULOS', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_origen: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nombre: {
      type: DataTypes.STRING(1),
      allowNull: true
    },
    id_proyecto: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_empresa: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'CAPITULOS',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "pk_capitulos",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
