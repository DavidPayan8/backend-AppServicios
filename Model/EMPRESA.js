const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const EMPRESA = sequelize.define(
    "EMPRESA",
    {
      id_empresa: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      id_origen: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      nombre: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      cif: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      razon_social: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      telefono: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      direccion: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "EMPRESA",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "PK__empresa__4A0B7E2C5D593A98",
          unique: true,
          fields: [{ name: "id_empresa" }],
        },
        {
          name: "UQ__empresa__D837D05C2F4B88A8",
          unique: true,
          fields: [{ name: "cif" }],
        },
      ],
    }
  );
  EMPRESA.associate = (models) => {
    EMPRESA.hasOne(models.CONFIG_EMPRESA, {
      foreignKey: "id_empresa",
      as: "config",
    });

    EMPRESA.hasMany(models.CONFIGURACIONES, {
      foreignKey: "id_empresa",
      as: "configuraciones",
    });

    EMPRESA.hasMany(models.USUARIOS, {
      foreignKey: "id_empresa",
      as: "usuarios",
    });

    EMPRESA.hasMany(models.CLIENTES, {
      foreignKey: "id_empresa",
      as: "clientes",
    });

    EMPRESA.hasMany(models.ORDEN_TRABAJO, {
      foreignKey: "id_empresa",
      as: "orden_trabajo",
    });

    EMPRESA.hasMany(models.CONTRATO, {
      foreignKey: "id_empresa",
      as: "contrato",
    });

    EMPRESA.hasMany(models.CABECERA, {
      foreignKey: "id_empresa",
      as: "cabecera",
    });

    EMPRESA.hasMany(models.NOTIFICACIONES, {
      foreignKey: "id_empresa",
      as: "notificaciones",
    });

    EMPRESA.hasMany(models.PROYECTOS, {
      foreignKey: "id_empresa",
      as: "proyectos",
    });

    EMPRESA.hasMany(models.TIPOS_VACACION, {
      foreignKey: "id_empresa",
      as: "tipo_vacacion",
    });

    EMPRESA.hasMany(models.ARTICULOS, {
      foreignKey: "id_empresa",
      as: "articulos",
    });

    EMPRESA.belongsToMany(models.MODULOS, {
      as: "empresa_modulos_modulos",
      through: models.EMPRESAS_MODULOS,
      foreignKey: "id_empresa",
      otherKey: "id_modulo",
    });

    EMPRESA.belongsToMany(models.SUBMODULOS, {
      as: "empresa_submodulos_submodulos",
      through: models.EMPRESAS_SUBMODULOS,
      foreignKey: "id_empresa",
      otherKey: "id_submodulo",
    });

    EMPRESA.hasMany(models.EMPRESAS_MODULOS, {
      as: "empresa_modulos",
      foreignKey: "id_empresa",
    });

    EMPRESA.hasMany(models.EMPRESAS_SUBMODULOS, {
      as: "empresa_submodulos",
      foreignKey: "id_empresa",
    });

    EMPRESA.hasMany(models.CATEGORIA_LABORAL, {
      as: "Categoria_laboral",
      foreignKey: "id_empresa",
    });

    EMPRESA.hasMany(models.ANOTACION_AGENDA, {
      foreignKey: "id_empresa",
      as: "anotaciones_agenda",
    });

    EMPRESA.hasMany(models.SOLICITUD, {
      foreignKey: "empresa_id",
      as: "solicitud",
    });
  };

  return EMPRESA;
};
