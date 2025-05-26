const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('TIPOS_IVA', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Tipo_IVA: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    IVA: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false
    },
    id_empresa: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'TIPOS_IVA',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__TIPOS_IV__3213E83F5F7AAD18",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
