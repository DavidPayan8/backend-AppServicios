const { generarUrlTemporalAzure } = require("../Model/others/blobStorageModel");

async function generarSAS(req, ambito, nombreArchivo, id_usuario, empresa, tipo, expiracionMin = 60) {
    try {
        const url = await generarUrlTemporalAzure(ambito, nombreArchivo, id_usuario, empresa, tipo, expiracionMin);
        return url;
    } catch (error) {
        console.error("Error generando SAS:", error);
        throw new Error("No se pudo generar la URL de acceso temporal.");
    }
}

module.exports = { generarSAS };