const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const CONFIG_EMPRESA = sequelize.define(
    "CONFIG_EMPRESA",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      logo_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      smtp_host: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      smtp_port: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      smtp_user: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      smtp_pass: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      es_tipo_obra: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      id_empresa: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      email_entrante: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      color_principal: {
        type: DataTypes.STRING(7),
        allowNull: true,
        defaultValue: "#0d5c91",
      },
      hay_primer_inicio: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
    },
    {
      sequelize,
      tableName: "CONFIG_EMPRESA",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "PK__CONFIG_E__3213E83FF3B9EB84",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );
  CONFIG_EMPRESA.associate = (models) => {
    CONFIG_EMPRESA.belongsTo(models.EMPRESA, {
      foreignKey: "id_empresa",
      as: "empresa",
    });
  };

  return CONFIG_EMPRESA;
};
