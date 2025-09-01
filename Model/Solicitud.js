const Sequelize = require("sequelize");
const { now } = require("sequelize/lib/utils");

module.exports = function (sequelize, DataTypes) {
    const SOLICITUD = sequelize.define(
        "SOLICITUD",
        {
            id: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
            },
            id_origen: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            usuario_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            empresa_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            fecha_solicitud: {
                type: DataTypes.DATE,
                defaultValue: sequelize.literal("GETDATE()"),
                allowNull: false,
            },
            cliente_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "CLIENTES",
                    key: "id",
                },
            },
            peticionario_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "PETICIONARIO",
                    key: "id",
                },
            },
            nota: {
                type: DataTypes.STRING(2000),
                allowNull: true,
            },
            estado: {
                type: DataTypes.TINYINT,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    isIn: [[0, 1, 2]]
                }
            }
        },
        {
            sequelize,
            tableName: "SOLICITUD",
            schema: "dbo",
            timestamps: false,
            indexes: [
                {
                    name: "PK_SOLICITUD_ID",
                    unique: true,
                    fields: [{ name: "id" }],
                },
            ],
        }
    );

    SOLICITUD.associate = (models) => {

        SOLICITUD.belongsTo(models.EMPRESA, {
            as: "empresa",
            foreignKey: "empresa_id",
        });

        SOLICITUD.belongsTo(models.CLIENTES, {
            as: "solicitud_cliente",
            foreignKey: "cliente_id",
        });

        SOLICITUD.belongsTo(models.PETICIONARIO, {
            as: "solicitud_peticionario",
            foreignKey: "peticionario_id",
        });

        SOLICITUD.belongsTo(models.USUARIOS, {
            as: "usuario",
            foreignKey: "usuario_id",
        });
    };


    return SOLICITUD;
};
