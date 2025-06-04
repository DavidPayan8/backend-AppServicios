const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const USUARIOS = sequelize.define(
    "USUARIOS",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      id_origen: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      user_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      contrasena: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      nomapes: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      id_config: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      id_empresa: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      DNI: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      num_seguridad_social: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      rol: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "usuario",
      },
      primer_inicio: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      telefono: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      sexo: {
        type: DataTypes.CHAR(1),
        allowNull: true,
        defaultValue: "X",
      },
    },
    {
      sequelize,
      tableName: "USUARIOS",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "IX_UNIQUE_DNI",
          unique: true,
          fields: [{ name: "DNI" }],
        },
        {
          name: "pk_usuarios",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );
  USUARIOS.associate = (models) => {
    USUARIOS.hasMany(models.VACACIONES, {
      foreignKey: "id_usuario",
      as: "vacaciones",
    });

    USUARIOS.belongsTo(models.EMPRESA, {
      foreignKey: "id_empresa",
      as: "empresa",
    });

    USUARIOS.hasMany(models.CONTROL_ASISTENCIAS, {
      foreignKey: "id_usuario",
      as: "controlAsistencias",
    });

    USUARIOS.hasMany(models.CALENDARIO, {
      foreignKey: "id_usuario",
      as: "calendario",
    });

    USUARIOS.hasMany(models.ORDEN_TRABAJO, {
      foreignKey: "id_usuario",
      as: "orden_trabajo",
    });

    USUARIOS.hasMany(models.PARTES_TRABAJO, {
      foreignKey: "id_usuario",
      as: "partes_trabajo",
    });

    USUARIOS.hasMany(models.NOTIFICACIONES, {
      foreignKey: "id_emisor",
      as: "emisor",
    });

    USUARIOS.hasMany(models.NOTIFICACIONES_USUARIOS, {
      foreignKey: "id_usuario",
      as: "notificaciones_usuarios",
    });

    USUARIOS.belongsTo(models.CATEGORIA_LABORAL, {
      foreignKey: "categoria_laboral_id",
      as: "categoriaLaboral",
    });
  };

  return USUARIOS;
};
