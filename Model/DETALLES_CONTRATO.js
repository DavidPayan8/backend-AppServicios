const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const DETALLES_CONTRATO = sequelize.define(
    "DETALLES_CONTRATO",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      id_origen: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      id_contrato: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      articulo_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      descripcion: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      descripcion_larga: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      cantidad: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
      },
      descuento: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "DETALLES_CONTRATO",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "PK__DETALLES__3213E83FD6E11ECA",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );

  DETALLES_CONTRATO.associate = (models) => {
    DETALLES_CONTRATO.belongsTo(models.CONTRATO, {
      foreignKey: "id_contrato",
      as: "contrato",
    });

    DETALLES_CONTRATO.belongsTo(models.ARTICULOS, {
      foreignKey: "articulo_id",
      as: "articulo_contrato",
    });
  };

  return DETALLES_CONTRATO;
};
