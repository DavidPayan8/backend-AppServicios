module.exports = (sequelize, DataTypes) => {
    const TARIFAS_CATEGORIAS = sequelize.define(
        "TARIFAS_CATEGORIAS",
        {
            id_tarifa: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            id_grupo: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            id_empresa: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            horas_jornada: {
                type: DataTypes.DECIMAL(5, 2),
                allowNull: false,
            },
            salario_base: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            fecha_inicio: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            fecha_fin: {
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
        },
        {
            tableName: "TARIFAS_CATEGORIAS",
            timestamps: false,
        }
    );

    TARIFAS_CATEGORIAS.associate = (models) => {
        TARIFAS_CATEGORIAS.belongsTo(models.CATEGORIA_LABORAL, {
            foreignKey: "id_grupo",
            as: "categoriaLaboral",
            onDelete: 'CASCADE',
        });

        TARIFAS_CATEGORIAS.belongsTo(models.EMPRESA, {
            foreignKey: "id_empresa",
            as: "empresa",
        });
    };

    return TARIFAS_CATEGORIAS;
};
