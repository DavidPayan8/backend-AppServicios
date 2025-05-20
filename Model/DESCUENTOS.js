const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('DESCUENTOS', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    texto: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    porcentaje: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false
    },
    id_empresa: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'DESCUENTOS',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__DESCUENT__3213E83FF525DDED",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
