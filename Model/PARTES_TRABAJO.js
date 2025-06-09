module.exports = function (sequelize, DataTypes) {
  const PARTES_TRABAJO = sequelize.define(
    "PARTES_TRABAJO",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_proyecto: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_capitulo: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      id_partida: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      hora_entrada: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      hora_salida: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      fecha: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      localizacion_entrada: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      horas_extra: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      horas_festivo: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      estado_traspaso: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      id_origen: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      localizacion_salida: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      observaciones: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "PARTES_TRABAJO",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "pk_partes_trabajo",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );

  PARTES_TRABAJO.associate = (models) => {
    PARTES_TRABAJO.belongsTo(models.ORDEN_TRABAJO, {
      foreignKey: "id_usuario",
      as: "orden_trabajo",
    });
  };
  return PARTES_TRABAJO;
};
