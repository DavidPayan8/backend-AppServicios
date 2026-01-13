module.exports = (sequelize, DataTypes) => {
  const PersonalAutorizadoProyecto = sequelize.define(
    "PersonalAutorizadoProyecto",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      Personal_Id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: "Personal_Id",
      },
      Proyecto_Id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: "Proyecto_Id",
      },
      Autorizado_Id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: null,
        field: "Autorizado_Id",
      },
      Fecha_Autorizacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: "Fecha_Autorizacion",
      },
      Activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "Activo",
      },
    },
    {
      tableName: "Personal_Autorizado_Proyecto",
      timestamps: true,
      underscored: false,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      indexes: [
        {
          fields: ["Personal_Id", "Proyecto_Id"],
          name: "IX_Personal_Proyecto",
          unique: true,
        },
        {
          fields: ["Proyecto_Id"],
          name: "IX_Proyecto",
        },
        {
          fields: ["Autorizado_Id"],
          name: "IX_Autorizado",
        },
        {
          fields: ["Activo"],
          name: "IX_Activo",
        },
      ],
    }
  );

  PersonalAutorizadoProyecto.associate = (models) => {
    // Relación con el Personal (trabajador autorizado)
    PersonalAutorizadoProyecto.belongsTo(models.USUARIOS, {
      foreignKey: "Personal_Id",
      as: "personal",
      targetKey: "id",
    });

    // Relación con el Proyecto
    PersonalAutorizadoProyecto.belongsTo(models.PROYECTOS, {
      foreignKey: "Proyecto_Id",
      as: "proyecto",
      targetKey: "id",
    });

    // Relación con el Usuario que autoriza
    PersonalAutorizadoProyecto.belongsTo(models.USUARIOS, {
      foreignKey: "Autorizado_Id",
      as: "usuario_autorizador",
      targetKey: "id",
      allowNull: true,
    });
  };

  return PersonalAutorizadoProyecto;
};
