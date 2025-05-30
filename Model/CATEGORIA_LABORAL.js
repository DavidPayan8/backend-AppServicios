module.exports = (sequelize, DataTypes) => {
  const CATEGORIA_LABORAL = sequelize.define('CATEGORIA_LABORAL', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    salario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  }, {
    tableName: 'CATEGORIA_LABORAL',
    timestamps: false,
  });

  CATEGORIA_LABORAL.associate = (models) => {
    CATEGORIA_LABORAL.hasMany(models.USUARIOS, {
      foreignKey: 'categoria_laboral_id',
      as: 'usuarios',
    });
  };

  return CATEGORIA_LABORAL;
};
