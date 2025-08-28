
module.exports = function (sequelize, DataTypes) {
    const IndiceDocumento = sequelize.define("Indice_Documento", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        ruta: {
            type: DataTypes.STRING(500),
            allowNull: false
        },
        operacion: {
            type: DataTypes.ENUM("crear", "editar", "borrar"),
            allowNull: false
        },
        fecha_modificacion: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        sincronizado: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        id_empresa: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    },
        {
            sequelize,
            tableName: "Indice_Documento",
            schema: "dbo",
            timestamps: false
        }
    );

    IndiceDocumento.associate = (models) => {
        IndiceDocumento.belongsTo(models.EMPRESA, {
            foreignKey: "id_empresa",
            as: "indice_documento_empresa",
        });
    }

    return IndiceDocumento;
}