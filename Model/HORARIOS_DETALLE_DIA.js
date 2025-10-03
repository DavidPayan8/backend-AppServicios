module.exports = (sequelize, DataTypes) => {
    const HORARIOS_DETALLE_DIA = sequelize.define(
        "HORARIOS_DETALLE_DIA",
        {
            id_detalle: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            id_tramo: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            dia_semana: {
                type: DataTypes.TINYINT,
                allowNull: false,
                validate: {
                    min: 1,
                    max: 7,
                },
            },
            activo: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        },
        {
            tableName: "HORARIOS_DETALLE_DIA",
            timestamps: false,
        }
    );

    HORARIOS_DETALLE_DIA.associate = (models) => {
        HORARIOS_DETALLE_DIA.belongsTo(models.HORARIOS_TRAMOS, {
            foreignKey: "id_tramo",
            as: "tramo",
            onDelete: "CASCADE",
        });
    };

    return HORARIOS_DETALLE_DIA;
};
