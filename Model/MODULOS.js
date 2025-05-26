const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const MODULOS = sequelize.define('MODULOS', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    clave_modulo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: "UQ__MODULOS__5CA4C00B057CD50B"
    }
  }, {
    sequelize,
    tableName: 'MODULOS',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__MODULOS__3213E83F39BF6B1D",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "UQ__MODULOS__5CA4C00B057CD50B",
        unique: true,
        fields: [
          { name: "clave_modulo" },
        ]
      },
    ]
  });

  MODULOS.associate = (models) => {
    MODULOS.belongsToMany(models.EMPRESA, {
      as: "modulo_empresas", // antes: "modulos" (conflictivo con entidad en sí)
      through: models.EMPRESAS_MODULOS,
      foreignKey: "id_modulo",
      otherKey: "id_empresa",
    });
    
    MODULOS.hasMany(models.EMPRESAS_MODULOS, {
      as: "modulo_empresas_modulos", // antes: "empresa_modulos"
      foreignKey: "id_modulo",
    });
    
    MODULOS.hasMany(models.SUBMODULOS, {
      as: "modulo_submodulos", // antes: "modulos_submodulos"
      foreignKey: "id_modulo",
    });
  };

  return MODULOS;
};
