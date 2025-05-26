const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const DETALLES_DOC = sequelize.define(
    "DETALLES_DOC",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      cabecera_Id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      articulo_Id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      descripcion_articulo: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      descripcion_larga: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      cantidad: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      tarifa_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      descuento: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      importe_neto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      iva_porcentaje: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      cuota_iva: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      total_linea: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      id_origen: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "DETALLES_DOC",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "PK__DETALLES__3213E83FE95BC801",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );

  DETALLES_DOC.associate = (models) => {
    DETALLES_DOC.belongsTo(models.CABECERA, {
      foreignKey: "cabecera_id",
      as: "cabecera",
    });

    DETALLES_DOC.belongsTo(models.ARTICULOS, {
      foreignKey: "articulo_Id",
      as: "articulo_doc",
    });
  };
  return DETALLES_DOC;
};
