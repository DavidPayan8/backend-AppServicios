module.exports = (sequelize, DataTypes) => {
    const ASIGNACION_HORARIO_USUARIO = sequelize.define(
      "ASIGNACION_HORARIO_USUARIO",
      {
        id_asignacion: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        id_usuario: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        id_horario: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        fecha_asignacion: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        fecha_fin: {
          type: DataTypes.DATEONLY,
          allowNull: true,
        },
        activo: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
      },
      {
        tableName: "ASIGNACION_HORARIO_USUARIO",
        timestamps: false,
      }
    );
  
    ASIGNACION_HORARIO_USUARIO.associate = (models) => {
      ASIGNACION_HORARIO_USUARIO.belongsTo(models.USUARIOS, {
        foreignKey: "id_usuario",
        as: "usuario",
      });
  
      ASIGNACION_HORARIO_USUARIO.belongsTo(models.HORARIOS_PLANTILLA, {
        foreignKey: "id_horario",
        as: "horario",
      });
    };
  
    return ASIGNACION_HORARIO_USUARIO;
  };
  