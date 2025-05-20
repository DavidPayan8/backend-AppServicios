const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const EMPRESAS_SUBMODULOS = sequelize.define(
    "EMPRESAS_SUBMODULOS",
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
      id_submodulo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "SUBMODULOS",
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
      tableName: "EMPRESAS_SUBMODULOS",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "PK__EMPRESAS__58CB0CF705805206",
          unique: true,
          fields: [{ name: "id_empresa" }, { name: "id_submodulo" }],
        },
      ],
    }
  );

  EMPRESAS_SUBMODULOS.associate = (models) => {
    EMPRESAS_SUBMODULOS.belongsTo(models.EMPRESA, {
      as: "empresas_submodulo_empresa", // alias único y claro
      foreignKey: "id_empresa",
    });

    EMPRESAS_SUBMODULOS.belongsTo(models.SUBMODULOS, {
      as: "empresas_submodulo_submodulo", // alias único y claro
      foreignKey: "id_submodulo",
    });
  };

  return EMPRESAS_SUBMODULOS;
};
