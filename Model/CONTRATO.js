const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const CONTRATO = sequelize.define(
    "CONTRATO",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      Numero_Contrato: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      ID_Cliente: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      Fecha_Alta: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.fn("getdate"),
      },
      Fecha_Vencimiento: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      Monto: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
      },
      Activo: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
      id_origen: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      id_servicio_origen: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      descripcion: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      id_empresa: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "CONTRATO",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "PK__CONTRATO__3213E83F99439E7B",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );
  CONTRATO.associate = (models) => {
    CONTRATO.belongsTo(models.EMPRESA, {
      foreignKey: "id_empresa",
      as: "empresa",
    });

    CONTRATO.belongsTo(models.CLIENTES, {
      foreignKey: "ID_cliente",
      as: "cliente",
    });

    CONTRATO.belongsTo(models.PROYECTOS, {
      foreignKey: "Id_Servicio_Origen",
      as: "proyecto",
    });

    CONTRATO.hasMany(models.DETALLES_CONTRATO, {
      foreignKey: "id_cliente",
      as: "detalles_contrato",
    });
  };

  return CONTRATO;
};
