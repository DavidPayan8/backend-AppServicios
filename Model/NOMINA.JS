module.exports = (sequelize, DataTypes) => {
  const Nomina = sequelize.define('NOMINA', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'Id'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'IdUsuario',
      references: { model: 'Users', key: 'Id' }
    },
    ambito: {
      type: DataTypes.STRING(50),
      field: 'ambito'
    },
    tipo: {
      type: DataTypes.STRING(50),
      field: 'tipo'
    },
    nombreOriginal: {
      type: DataTypes.STRING(255),
      field: 'nombreOriginal'
    },
    ruta: {
      type: DataTypes.STRING(1000),
      field: 'Ruta'
    },
    tamano: {
      type: DataTypes.BIGINT,
      field: 'Tamano'
    },
    fechaSubida: {
      type: DataTypes.DATE,
      field: 'FechaSubida',
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'Nominas',
    timestamps: false,     
    freezeTableName: true
  });

  Nomina.associate = (models) => {
    Nomina.belongsTo(models.User, { foreignKey: 'userId', targetKey: 'id' });
  };

  return Nomina;
};
