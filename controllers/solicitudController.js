const db = require("../Model");
const { mapSolicitudNomalized } = require("../resources/solicitud");
const { enviarSolicitud } = require('../controllers/emailController');
const { paginatedResponse } = require('../resources/helpers/paginator');
const SOLICITUD = db.SOLICITUD;

const getAllSolicitudes = async (req, res) => {
    try {
        const { empresa, id } = req.user;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { rows, count } = await SOLICITUD.findAndCountAll({
            where: {
                usuario_id: id,
                empresa_id: empresa,
            },
            include: [
                { model: db.PETICIONARIO, as: 'solicitud_peticionario' },
                { model: db.CLIENTES, as: 'solicitud_cliente' }
            ],
            limit,
            offset,
            order: [['fecha_solicitud', 'DESC']]
        });

        const data = rows.map(mapSolicitudNomalized);

        res.status(200).json(paginatedResponse(data, count, page, limit));

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error al obtener solicitudes", error });
    }
};

// Obtener una sola solicitud por ID (con validación de empresa)
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const { empresa } = req.user;

        const solicitud = await SOLICITUD.findOne({
            where: {
                id,
                empresa_id: empresa,
            },
            include: [
                { model: db.PETICIONARIO, as: "solicitud_peticionario" },
                { model: db.CLIENTES, as: "solicitud_cliente" },
            ],
        });

        if (!solicitud) {
            return res.status(404).json({ message: "Solicitud no encontrada" });
        }

        res.status(200).json(mapSolicitudNomalized(solicitud));
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la solicitud", error });
    }
}

// Crear una nueva solicitud
const create = async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const { empresa, id } = req.user;
        const {
            fecha_solicitud,
            cliente_id,
            peticionario_id,
            nota,
        } = req.body;

        let archivos = req.files?.archivos || [];

        if (!Array.isArray(archivos)) archivos = [archivos];

        const nuevaSolicitud = await db.SOLICITUD.create({
            usuario_id: id,
            cliente_id,
            fecha_solicitud,
            empresa_id: empresa,
            peticionario_id,
            nota,
        }, { transaction: t });

        // Reconsultar para traer relaciones
        const solicitudCompleta = await db.SOLICITUD.findOne({
            where: {
                id: nuevaSolicitud.id,
                empresa_id: empresa,
            },
            include: [
                { model: db.PETICIONARIO, as: "solicitud_peticionario" },
                { model: db.CLIENTES, as: "solicitud_cliente" },
            ],
            transaction: t,
        });


        // Enviar el correo pasando los datos
        const info = await enviarSolicitud({
            solicitud_id: nuevaSolicitud.id,
            empresaId: empresa,
            archivos,
            user: id,
            accion: 'create'
        });

        await t.commit();

        return res.status(201).json(mapSolicitudNomalized(solicitudCompleta));
    } catch (error) {
        await t.rollback();
        console.error('Error al crear solicitud:', error.message);
        return res.status(500).json({ message: 'Error al crear solicitud', error: error.message });
    }
};

const update = async (req, res) => {
    const t = await db.sequelize.transaction();

    try {

        const { id } = req.params;
        const { empresa } = req.user;
        const {
            peticionario_id,
            nota,
            id_origen,
        } = req.body;

        let archivos = req.files?.archivos || [];
        if (!Array.isArray(archivos)) archivos = [archivos];

        // Buscar solicitud original
        const solicitud = await db.SOLICITUD.findOne({
            where: { id, empresa_id: empresa },
            transaction: t
        });

        if (!solicitud) {
            await t.rollback();
            return res.status(404).json({ message: "Solicitud no encontrada" });
        }

        // Actualizar la solicitud
        await solicitud.update({
            peticionario_id,
            nota,
            id_origen,
        }, { transaction: t });

        // Reconsultar para incluir relaciones
        const solicitudActualizada = await db.SOLICITUD.findOne({
            where: {
                id: solicitud.id,
                empresa_id: empresa,
            },
            include: [
                { model: db.PETICIONARIO, as: "solicitud_peticionario" },
                { model: db.CLIENTES, as: "solicitud_cliente" },
            ],
            transaction: t,
        });

        // Enviar el email
        await enviarSolicitud({
            solicitud_id: solicitud.id,
            empresaId: empresa,
            archivos,
            user: id,
            accion: 'update'
        });

        await t.commit();

        return res.status(200).json(mapSolicitudNomalized(solicitudActualizada));
    } catch (error) {
        await t.rollback();
        console.error("Error al actualizar solicitud:", error);
        return res.status(500).json({
            message: "Error al actualizar solicitud",
            error: error.message || error,
        });
    }
};

// Eliminar una solicitud
const deleteSolicitud = async (req, res) => {
    try {
        const { id } = req.params;

        const solicitud = await SOLICITUD.findOne({
            where: { id },
        });

        if (!solicitud) {
            return res.status(404).json({ message: "Solicitud no encontrada" });
        }

        await solicitud.destroy();

        res.status(204).json({ message: "Solicitud eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar solicitud", error });
    }
}



module.exports = {
    getAllSolicitudes,
    getById,
    create,
    update,
    deleteSolicitud
};