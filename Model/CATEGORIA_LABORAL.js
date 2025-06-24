module.exports = (sequelize, DataTypes) => {
  const CATEGORIA_LABORAL = sequelize.define(
    "CATEGORIA_LABORAL",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_origen: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_empresa: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
    },
    {
      tableName: "CATEGORIA_LABORAL",
      timestamps: false,
    }
  );

  CATEGORIA_LABORAL.associate = (models) => {
    CATEGORIA_LABORAL.hasMany(models.USUARIOS, {
      foreignKey: "categoria_laboral_id",
      as: "usuarios",
    });

    CATEGORIA_LABORAL.belongsTo(models.EMPRESA, {
      foreignKey: "id_empresa",
      as: "empresa",
    });
  };

  return CATEGORIA_LABORAL;
};
