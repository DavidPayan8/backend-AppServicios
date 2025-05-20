const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const ARTICULOS = sequelize.define(
    "ARTICULOS",
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
      nombre: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      descripcion: {
        type: DataTypes.STRING(250),
        allowNull: true,
      },
      iva: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      tarifa_base: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      referencia: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      utiles: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      descuento: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      tipo_Iva_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
      },
      numero_serie: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      id_empresa: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "ARTICULOS",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "pk_articulos",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );
  ARTICULOS.associate = (models) => {
    ARTICULOS.belongsTo(models.EMPRESA, {
      foreignKey: "id_empresa",
      as: "empresa",
    });

    ARTICULOS.hasMany(models.ORDEN_TRABAJO, {
      foreignKey: "articulo_id",
      as: "articulo_ot",
    });

    ARTICULOS.hasMany(models.DETALLES_DOC, {
      foreignKey: "articulo_Id",
      as: "articulo_doc",
    });

    ARTICULOS.hasMany(models.DETALLES_CONTRATO, {
      foreignKey: "articulo_id",
      as: "articulo_contrato",
    });
  };

  return ARTICULOS;
};
