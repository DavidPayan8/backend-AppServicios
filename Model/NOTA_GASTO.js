const Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
    const NotaGasto = sequelize.define('NotaGasto', {
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
        id_origen: {
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
        departamento: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        proyecto: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        fechaSolicitud: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        lineasGasto: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
            get() {
                const value = this.getDataValue('lineasGasto');
                if (typeof value === 'string') {
                    try {
                        return JSON.parse(value);
                    } catch {
                        return [];
                    }
                }
                return Array.isArray(value) ? value : [];
            },
            validate: {
                isValidArray(value) {
                    if (!Array.isArray(value) || value.length === 0) {
                        throw new Error('Debe haber al menos una línea de gasto');
                    }
                }
            }
        },
        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00,
            validate: {
                min: 0
            }
        },
        estado: {
            type: DataTypes.ENUM('borrador', 'pendiente', 'aprobada', 'rechazada'),
            allowNull: false,
            defaultValue: 'borrador'
        },
        observaciones: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        aprobadoPor: {
            type: DataTypes.STRING,
            allowNull: true
        },
        fechaAprobacion: {
            type: DataTypes.DATE,
            allowNull: true
        },
        motivoRechazo: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        rechazadoPor: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        sequelize,
        tableName: 'notas_gasto',
        schema: 'dbo',
        timestamps: true,
        createdAt: 'fechaCreacion',
        updatedAt: 'fechaActualizacion',
        indexes: [
            { fields: ['empleado'] },
            { fields: ['departamento'] },
            { fields: ['estado'] },
            { fields: ['fechaSolicitud'] }
        ]
    });

    // ========================
    // Métodos de instancia
    // ========================
    NotaGasto.prototype.calcularTotal = function () {
        if (!this.lineasGasto || !Array.isArray(this.lineasGasto)) {
            return 0;
        }

        return this.lineasGasto.reduce((total, linea) => {
            return total + (parseFloat(linea.cantidad) || 0);
        }, 0);
    };

    NotaGasto.prototype.validarLineasGasto = function () {
        const errores = [];

        if (!this.lineasGasto || this.lineasGasto.length === 0) {
            errores.push('Debe haber al menos una línea de gasto');
            return errores;
        }

        this.lineasGasto.forEach((linea, index) => {
            if (!linea.concepto || !linea.concepto.trim()) {
                errores.push(`Línea ${index + 1}: El concepto es obligatorio`);
            }
            if (!linea.categoria || !linea.categoria.trim()) {
                errores.push(`Línea ${index + 1}: La categoría es obligatoria`);
            }
            if (!linea.cantidad || parseFloat(linea.cantidad) <= 0) {
                errores.push(`Línea ${index + 1}: El importe debe ser mayor que 0`);
            }
            if (!linea.fecha) {
                errores.push(`Línea ${index + 1}: La fecha es obligatoria`);
            }
        });

        return errores;
    };

    // ========================
    // Hooks
    // ========================
    NotaGasto.beforeSave(async (notaGasto) => {
        notaGasto.total = notaGasto.calcularTotal();
    });

    // ========================
    // Relaciones
    // ========================
    NotaGasto.associate = (models) => {
        NotaGasto.belongsTo(models.EMPRESA, {
            as: 'empresa',
            foreignKey: 'id_empresa'
        });

        NotaGasto.belongsTo(models.USUARIOS, {
            as: 'empleado_rel',
            foreignKey: 'empleado'
        });

        NotaGasto.belongsTo(models.ORDEN_TRABAJO, {
            as: 'proyecto_rel',
            foreignKey: 'proyecto'
        });
    };

    return NotaGasto;
};
