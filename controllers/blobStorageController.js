const {
    uploadToAzure,
    deleteArchivoAzure,
    listadoArchivosAzure,
    downloadArchivoAzure,
    generarUrlTemporalAzure
} = require("../Model/others/blobStorageModel");
const { enviarAdjuntosOt } = require('./emailController')
const db = require("../Model");
const mime = require("mime-types");

const obtenerListadoAzure = async (req, res) => {
    const { id, empresa } = req.user;
    const { ambito, tipo, identify } = req.query;

    try {
        console.log("[BACK] llamada a listadoArchivos");
        let identification = null;

        if (identify && identify !== 0) {
            identification = Number(identify);
        } else {
            identification = id;
        }

        const listado = await listadoArchivosAzure(ambito, identification, empresa, tipo);
        return res.status(200).json(listado);
    } catch (error) {
        console.error("Error al obtener listado FTP:", error);
        res.status(500).json({ error: "Error al obtener listado de archivos." });
    }
};

const descargarArchivoAzure = async (req, res) => {
    const { nombreArchivo, tipo, ambito, identify } = req.query;
    const { id, empresa } = req.user;

    let identification = null;

    if (identify && identify !== 0) {
        identification = Number(identify);
    } else {
        identification = id;
    }

    try {
        const { buffer, fileName } = await downloadArchivoAzure(
            ambito,
            nombreArchivo,
            identification,
            empresa,
            tipo,
        );
        res.setHeader(
            "Content-Type",
            mime.lookup(fileName) || "application/octet-stream"
        );
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        res.status(200).send(buffer);
    } catch (error) {
        console.error("Fallo en descarga:", error);
        if (!res.headersSent)
            res.status(500).json({ message: "Error al procesar la descarga." });
    }
};

const visualizarArchivoAzure = async (req, res) => {
    const { nombreArchivo, tipo, ambito, identify } = req.query;
    const { id, empresa } = req.user;

    const identification = identify && identify !== "0" ? Number(identify) : id;

    try {
        // Obtenemos la URL temporal (SAS)
        const url = await generarUrlTemporalAzure(
            ambito,
            nombreArchivo,
            identification,
            empresa,
            tipo,
            60 // minutos de validez
        );

        res.status(200).json({ url });
    } catch (error) {
        console.error("Error generando URL temporal:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Error al generar la URL de visualización." });
        }
    }
};

const subirTarjetaContacto = async (req, res) => {
    const { empresa } = req.user;
    const id_usuario = req.user.id;
    const tipo = 'contacto';
    const ambito = 'Personal';

    try {
        const archivos = req.files;
        let extensionCara = null;
        let extensionAnverso = null

        if (!archivos || Object.keys(archivos).length === 0) {
            return res.status(400).json({ error: 'No se recibió ningún archivo.' });
        }

        // Subir cara
        if (archivos.cara) {
            const archivoCara = Array.isArray(archivos.cara) ? archivos.cara[0] : archivos.cara;
            extensionCara = archivoCara.filename.substring(archivoCara.filename.lastIndexOf('.'));
            archivoCara.filename = `cara${extensionCara}`;
            await uploadToAzure(ambito, archivoCara, id_usuario, empresa, tipo);
        }

        // Subir anverso
        if (archivos.anverso) {
            const archivoAnverso = Array.isArray(archivos.anverso) ? archivos.anverso[0] : archivos.anverso;
            extensionAnverso = archivoAnverso.filename.substring(archivoAnverso.filename.lastIndexOf('.'));
            archivoAnverso.filename = `anverso${extensionAnverso}`;
            await uploadToAzure(ambito, archivoAnverso, id_usuario, empresa, tipo);
        }

        const camposActualizados = {};
        if (extensionCara) camposActualizados.ext_cara = extensionCara;
        if (extensionAnverso) camposActualizados.ext_anverso = extensionAnverso;

        if (Object.keys(camposActualizados).length > 0) {
            await db.USUARIOS.update(camposActualizados, {
                where: { id: id_usuario },
            });
        }


        res.status(200).json({ message: 'Tarjeta de contacto subida correctamente.' });
    } catch (error) {
        console.error('Error al subir tarjeta de contacto:', error);
        res.status(500).json({ error: error.message });
    }
};

const subirArchivoAzure = async (req, res) => {
    const { ambito, tipo, identify } = req.body;
    const { empresa, id } = req.user;

    let identification = null;

    if (identify && identify !== 0) {
        identification = Number(identify);
    } else {
        identification = id;
    }

    const archivos = Object.values(req.files)
        .flatMap(fileArray => Array.isArray(fileArray) ? fileArray : [fileArray]);


    try {
        await uploadToAzure(ambito, archivos, identification, empresa, tipo);
        /* if (tipo === 'OT') await enviarAdjuntosOt({ identify, empresa, archivos, accion: 'create', user: id }); */

        res.status(201).json({ message: "Archivo subido correctamente." });
    } catch (error) {
        console.log("Fallo al subir archivo:", error.message);
        res.status(500).json({ error: error.message });
    }
};

const eliminarArchivoAzure = async (req, res) => {
    const { empresa, id } = req.user;
    const { filename, tipo, identify, ambito } = req.body;

    let identification = null;

    if (identify && identify !== 0) {
        identification = Number(identify);
    } else {
        identification = id;
    }

    try {
        await deleteArchivoAzure(ambito, filename, identification, empresa, tipo);
        /* if (tipo === 'OT') await enviarAdjuntosOt({ identify, empresa, accion: 'delete', user: id }); */

        res.status(200).json({ message: "Archivo eliminado correctamente." });
    } catch (error) {
        console.error("Fallo al eliminar archivo:", error.message);
        res.status(500).json({ error: error.message });
    }
};

const visualizarTarjetaContacto = async (req, res) => {
    const { empresa } = req.user;
    const id_usuario = req.user.id;
    const tipo = "contacto";
    const ambito = "Personal";
    const expiracionMin = 60; // minutos de validez del SAS

    try {
        const usuario = await db.USUARIOS.findOne({
            attributes: ["ext_cara", "ext_anverso"],
            where: { id: id_usuario },
        });

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        const archivos = {};

        if (usuario.ext_cara) {
            const nombreCara = `cara${usuario.ext_cara}`;
            archivos.cara = {
                url: await generarUrlTemporalAzure(
                    ambito,
                    nombreCara,
                    id_usuario,
                    empresa,
                    tipo,
                    expiracionMin
                ),
                nombre: nombreCara
            };
        }

        if (usuario.ext_anverso) {
            const nombreAnverso = `anverso${usuario.ext_anverso}`;
            archivos.anverso = {
                url: await generarUrlTemporalAzure(
                    ambito,
                    nombreAnverso,
                    id_usuario,
                    empresa,
                    tipo,
                    expiracionMin
                ),
                nombre: nombreAnverso
            };
        }

        if (!archivos.cara && !archivos.anverso) {
            return res.status(404).json({ error: "No hay tarjeta de contacto subida." });
        }

        res.status(200).json({
            message: "URLs generadas correctamente.",
            archivos,  // ahora cada entrada tiene { url, nombre }
            expiracionMin,
        });
    } catch (error) {
        console.error("Error generando URLs de tarjeta de contacto:", error);
        res.status(500).json({ error: error.message });
    }
};


module.exports = {
    obtenerListadoAzure,
    subirArchivoAzure,
    eliminarArchivoAzure,
    visualizarArchivoAzure,
    subirTarjetaContacto,
    descargarArchivoAzure,
    visualizarTarjetaContacto
};
