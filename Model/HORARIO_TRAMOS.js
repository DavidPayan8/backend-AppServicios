module.exports = (sequelize, DataTypes) => {
    const HORARIOS_TRAMOS = sequelize.define(
      "HORARIOS_TRAMOS",
      {
        id_tramo: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        id_horario: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        hora_inicio: {
          type: DataTypes.TIME,
          allowNull: false,
        },
        hora_fin: {
          type: DataTypes.TIME,
          allowNull: false,
        },
        descripcion: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
      },
      {
        tableName: "HORARIOS_TRAMOS",
        timestamps: false,
      }
    );
  
    HORARIOS_TRAMOS.associate = (models) => {
      HORARIOS_TRAMOS.belongsTo(models.HORARIOS_PLANTILLA, {
        foreignKey: "id_horario",
        as: "horario",
      });

      HORARIOS_TRAMOS.hasMany(models.HORARIOS_DETALLE_DIA, {
        foreignKey: "id_tramo",
        as: "detallesDias",
        onDelete: "CASCADE",
    });
    };
  
    return HORARIOS_TRAMOS;
  };