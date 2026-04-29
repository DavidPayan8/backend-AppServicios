const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const TIPO_INMOVILIZADO = sequelize.define(
    "TIPO_INMOVILIZADO",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      Nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      codigo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      id_empresa: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_origen: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "TipoInmovilizado",
      schema: "dbo",
      timestamps: true,
      indexes: [
        {
          name: "pk_tipo_inmovilizado",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );

  TIPO_INMOVILIZADO.associate = (models) => {
    TIPO_INMOVILIZADO.belongsTo(models.EMPRESA, {
      foreignKey: "id_empresa",
      as: "empresa",
    });

    TIPO_INMOVILIZADO.hasMany(models.INMOVILIZADO, {
      foreignKey: "tipo_inmovilizado_id",
      as: "inmovilizados",
    });
  };

  return TIPO_INMOVILIZADO;
};
