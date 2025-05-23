const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('CONTROL_ASISTENCIAS_BACKUP', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    hora_entrada: {
      type: DataTypes.DATE,
      allowNull: true
    },
    hora_salida: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    id_origen: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    localizacion_entrada: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    localizacion_salida: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    estado_traspaso: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'CONTROL_ASISTENCIAS_BACKUP',
    schema: 'dbo',
    timestamps: false
  });
};
