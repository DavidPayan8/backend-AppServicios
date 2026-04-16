const Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
  const HorasExtra = sequelize.define('HorasExtra', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_empresa: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    empleado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    horaInicio: {
      type: DataTypes.STRING(5),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    horaFin: {
      type: DataTypes.STRING(5),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    duracionMinutos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  }, {
    sequelize,
    tableName: 'horas_extra',
    schema: 'dbo',
    timestamps: true,
    createdAt: 'fechaCreacion',
    updatedAt: 'fechaActualizacion',
    indexes: [
      { fields: ['empleado'] },
      { fields: ['fecha'] }
    ]
  });

  // ========================
  // Relaciones
  // ========================
  HorasExtra.associate = (models) => {
    HorasExtra.belongsTo(models.EMPRESA, {
      as: 'empresa',
      foreignKey: 'id_empresa'
    });

    HorasExtra.belongsTo(models.USUARIOS, {
      as: 'empleado_rel',
      foreignKey: 'empleado'
    });
  };

  return HorasExtra;
};
