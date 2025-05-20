const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const VACACIONES_ESTADOS = sequelize.define(
    "VACACIONES_ESTADOS",
    {
      id_vacacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      tiempo: {
        type: DataTypes.DATE,
        allowNull: false,
        primaryKey: true,
      },
      administrador: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      estado: {
        type: DataTypes.STRING(9),
        allowNull: false,
      },
      razon: {
        type: DataTypes.STRING(1024),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "VACACIONES_ESTADOS",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "PK_VACACIONES_ESTADOS",
          unique: true,
          fields: [{ name: "id_vacacion" }, { name: "tiempo" }],
        },
      ],
    }
  );

  VACACIONES_ESTADOS.associate = (models) => {
    VACACIONES_ESTADOS.belongsTo(models.VACACIONES, {
      foreignKey: "id_vacacion",
      targetKey: "id",
      as: "vacaciones_estado",
    });

    VACACIONES_ESTADOS.belongsTo(models.USUARIOS, {
      foreignKey: 'administrador',
      as: 'admin',
    });
  };

  return VACACIONES_ESTADOS;
};
