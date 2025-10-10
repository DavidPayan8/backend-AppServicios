module.exports = (sequelize, DataTypes) => {
    const HORARIOS_PLANTILLA = sequelize.define(
      "HORARIOS_PLANTILLA",
      {
        id_horario: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        id_empresa: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        nombre: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        descripcion: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        activo: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        fecha_inicio: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        fecha_fin: {
          type: DataTypes.DATEONLY,
          allowNull: true,
        },
      },
      {
        tableName: "HORARIOS_PLANTILLA",
        timestamps: false,
      }
    );
  
    HORARIOS_PLANTILLA.associate = (models) => {
      HORARIOS_PLANTILLA.hasMany(models.HORARIOS_TRAMOS, {
        foreignKey: "id_horario",
        as: "tramos",
      });
  
      HORARIOS_PLANTILLA.hasMany(models.ASIGNACION_HORARIO_USUARIO, {
        foreignKey: "id_horario",
        as: "asignaciones",
      });
    };
  
    return HORARIOS_PLANTILLA;
  };
  