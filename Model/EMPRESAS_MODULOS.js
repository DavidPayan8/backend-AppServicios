const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const EMPRESAS_MODULOS = sequelize.define(
    "EMPRESAS_MODULOS",
    {
      id_empresa: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "EMPRESA",
          key: "id_empresa",
        },
      },
      id_modulo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "MODULOS",
          key: "id",
        },
      },
      habilitado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },

    {
      sequelize,
      tableName: "EMPRESAS_MODULOS",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "PK__EMPRESAS__912EFAF31A873DB6",
          unique: true,
          fields: [{ name: "id_empresa" }, { name: "id_modulo" }],
        },
      ],
    }
  );
  EMPRESAS_MODULOS.associate = (models) => {
    EMPRESAS_MODULOS.belongsTo(models.EMPRESA, {
      as: "empresas_modulo_empresa", // antes: "empresa_modulos" (duplicado)
      foreignKey: "id_empresa",
    });

    EMPRESAS_MODULOS.belongsTo(models.MODULOS, {
      as: "empresas_modulo_modulo", // antes: "modulos_empresa" (duplicado)
      foreignKey: "id_modulo",
    });
  };

  return EMPRESAS_MODULOS;
};
