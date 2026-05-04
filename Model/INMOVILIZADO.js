const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const INMOVILIZADO = sequelize.define(
    "INMOVILIZADO",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      Codigo: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      Estado: {
        type: DataTypes.ENUM('Alta', 'Baja'),
        defaultValue: 'Alta',
        allowNull: false,
      },
      Fecha_alta: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      Fecha_baja: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      info_general: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      id_origen: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tipo_inmovilizado_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "TIPO_INMOVILIZADO",
          key: "id",
        },
      },
      Ubicacion: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "Inmovilizado",
      schema: "dbo",
      timestamps: true,
      indexes: [
        {
          name: "pk_inmovilizado",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );

  INMOVILIZADO.associate = (models) => {
    INMOVILIZADO.belongsTo(models.TIPO_INMOVILIZADO, {
      foreignKey: "tipo_inmovilizado_id",
      as: "tipo",
    });

    INMOVILIZADO.hasMany(models.MOVIMIENTOS_INMOVILIZADO, {
      foreignKey: "id_inmovilizado",
      as: "movimientos",
    });
  };

  return INMOVILIZADO;
};
