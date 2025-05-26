const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const SUBMODULOS = sequelize.define(
    "SUBMODULOS",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      id_modulo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "MODULOS",
          key: "id",
        },
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      clave: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: "UQ__SUBMODUL__71DCA3DBF601F6FB",
      },
    },
    {
      sequelize,
      tableName: "SUBMODULOS",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "PK__SUBMODUL__3213E83FB9D321B9",
          unique: true,
          fields: [{ name: "id" }],
        },
        {
          name: "UQ__SUBMODUL__71DCA3DBF601F6FB",
          unique: true,
          fields: [{ name: "clave" }],
        },
      ],
    }
  );

  SUBMODULOS.associate = (models) => {
    SUBMODULOS.belongsToMany(models.EMPRESA, {
      as: 'submodulo_empresas', // antes: 'empresas'
      through: models.EMPRESAS_SUBMODULOS,
      foreignKey: 'id_submodulo',
      otherKey: 'id_empresa',
    });
    
    SUBMODULOS.belongsTo(models.MODULOS, {
      as: "submodulo_modulo", // antes: "submodulos_modulos"
      foreignKey: "id_modulo",
    });
    
    SUBMODULOS.hasMany(models.EMPRESAS_SUBMODULOS, {
      as: "submodulo_empresas_submodulos", // antes: "submodulo_empresa_submod"
      foreignKey: "id_submodulo",
    });
  };

  return SUBMODULOS;
};
