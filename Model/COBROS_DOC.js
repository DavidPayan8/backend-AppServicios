const Sequelize = require("sequelize");

module.exports = function (sequelize, DataTypes) {
  const COBROS_DOC = sequelize.define(
    "COBROS_DOC",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      cabecera_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "CABECERA",
          key: "id",
        },
      },
      tipo_cobro: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      importe: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("GetDate()"),
      },
    },
    {
      sequelize,
      tableName: "COBROS_DOC",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "pk_cobro_doc",
          unique: true,
          fields: [{ name: "id" }],
        },
        {
          name: "fk_cabecera",
          fields: [{ name: "cabecera_id" }],
        },
      ],
    }
  );
  COBROS_DOC.associate = (models) => {
    COBROS_DOC.belongsTo(models.CABECERA, {
      foreignKey: "cabecera_id",
      as: "cabecera",
    });
  };
  return COBROS_DOC;
};
