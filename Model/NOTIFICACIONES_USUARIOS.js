const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const NOTIFICACIONES_USUARIOS=  sequelize.define('NOTIFICACIONES_USUARIOS', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_notificacion: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_origen: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    leido: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    fecha_leido: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'NOTIFICACIONES_USUARIOS',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__NOTIFICA__3213E83FF5A93E16",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  NOTIFICACIONES_USUARIOS.associate = (models) => {
    NOTIFICACIONES_USUARIOS.belongsTo(models.NOTIFICACIONES, {
      foreignKey: "id_notificacion",
      as: "notificacion",
    });

    NOTIFICACIONES_USUARIOS.belongsTo(models.USUARIOS, {
      foreignKey: "id_usuario",
      as: "usuarios",
    });
  }

  return NOTIFICACIONES_USUARIOS;
};
