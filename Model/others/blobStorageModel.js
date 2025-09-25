const {
    BlobServiceClient,
    StorageSharedKeyCredential,
    BlobSASPermissions,
    generateBlobSASQueryParameters
} = require("@azure/storage-blob");
const path = require("path");
const mime = require("mime-types");
const AdmZip = require("adm-zip");
const db = require("../../Model");

const AZURE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_CONNECTION_STRING);
const CONTAINER_NAME = process.env.AZURE_CONTAINER_NAME;

/**
 * Construye la ruta del blob Personal
 */
const createBlobPathPersonal = (ambito, nombreArchivo, identify, id_empresa, tipo) => {
    const dbname = process.env.DB_NAME;

    if (!nombreArchivo) {
        return `${dbname}/${id_empresa}/${ambito}/${identify}/${tipo}`;
    }

    return `${dbname}/${id_empresa}/${ambito}/${identify}/${tipo}/${nombreArchivo}`;
};

/**
 * Construye la ruta del blob para ambito Empresa
 * 
 * Estructuras:
 *  - Tipo OT:      db/empresa/Empresa/Proyectos/{idProyecto}/OT/{idOT}/{archivo}
 *  - Tipo General: db/empresa/Empresa/Proyectos/{idProyecto}/General/{archivo}
 */
const createBlobPathEmpresa = (
    ambito,
    nombreArchivo,
    identifyProyect,
    identifyOT,
    id_empresa,
    tipo
) => {
    const dbname = process.env.DB_NAME;

    let ruta = ''
    if (ambito !== "Empresa") {
        throw new Error("Ámbito no válido, se esperaba 'Empresa'");
    }

    // Base común
    const base = `${dbname}/${id_empresa}/${ambito}/Proyecto/${identifyProyect}`;

    if (tipo === "OT") {
        if (!identifyOT) throw new Error("Falta identifyOT para tipo OT");

        ruta = nombreArchivo
            ? `${base}/Ot/${identifyOT}/${nombreArchivo}`
            : `${base}/Ot/${identifyOT}`;
    }

    if (tipo === "General") {
        ruta = nombreArchivo
            ? `${base}/General/${nombreArchivo}`
            : `${base}/General`;
    }

    return ruta

};

/**
 * Subir archivos a Azure Blob Storage
 */
async function uploadToAzure(ambito, archivos, id_usuario, id_empresa, tipo) {

    let blobPath;
    const files = Array.isArray(archivos) ? archivos : [archivos];
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

    const transaction = await db.sequelize.transaction();

    try {
        for (const file of files) {
            if (!file || !Buffer.isBuffer(file.buffer)) {
                throw new Error(`El archivo ${file?.filename} no es un Buffer válido`);
            }

            const extension = path.extname(file.filename).toLowerCase();

            if (extension === ".zip") {
                const zip = new AdmZip(file.buffer);
                const zipEntries = zip.getEntries();

                for (const entry of zipEntries) {
                    if (!entry.isDirectory) {
                        const fileName = path.basename(entry.entryName);
                        const fileBuffer = entry.getData();
                        if (ambito === "Personal") {
                            blobPath = createBlobPathPersonal(ambito, fileName, id_usuario, id_empresa, tipo);
                        }

                        await registrarOperacionDocumento(
                            blobPath,
                            "crear",
                            transaction,
                            id_empresa,
                            id_usuario,
                            tipo
                        );

                        // Detectar el MIME de cada archivo dentro del ZIP
                        const contentType =
                            mime.lookup(fileName) || "application/octet-stream";

                        const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
                        await blockBlobClient.uploadData(fileBuffer, {
                            blobHTTPHeaders: {
                                blobContentType: contentType
                            }
                        });
                    }
                }
            } else {
                const blobPath = createBlobPath(
                    ambito,
                    file.filename,
                    id_usuario,
                    id_empresa,
                    tipo
                );

                await registrarOperacionDocumento(
                    blobPath,
                    "crear",
                    transaction,
                    id_empresa,
                    id_usuario,
                    tipo
                );

                // Detectar el MIME del archivo principal
                const contentType =
                    mime.lookup(file.filename) || "application/octet-stream";

                const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
                await blockBlobClient.uploadData(file.buffer, {
                    blobHTTPHeaders: {
                        blobContentType: contentType
                    }
                });
            }
        }

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        console.error("Error al subir archivo a Azure:", error);
        throw error;
    }
}

/**
 * Eliminar archivo en Azure
 */
async function deleteArchivoAzure(ambito, nombreArchivo, id_usuario, id_empresa, tipo) {
    let blobPath;
    if (ambito === "Personal") {
        blobPath = createBlobPathPersonal(ambito, nombreArchivo, id_usuario, id_empresa, tipo);
    }
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);


    const transaction = await db.sequelize.transaction();
    try {
        await registrarOperacionDocumento(blobPath, "borrar", transaction, id_empresa, id_usuario, tipo);
        await blockBlobClient.deleteIfExists();
        await transaction.commit();
    } catch (err) {
        await transaction.rollback();
        console.error(`Error eliminando archivo en Azure (${blobPath}):`, err);
        throw err;
    }
}

/**
 * Listar archivos de un directorio concreto
 */
async function listadoArchivosAzure(ambito, fileName, id_usuario, id_empresa, tipo) {
    let blobPath;
    if (ambito === "Personal") {
        blobPath = createBlobPathPersonal(ambito, fileName, id_usuario, id_empresa, tipo);
    }
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

    const iter = containerClient.listBlobsFlat({ prefix: blobPath + "/" });
    const listado = [];
    for await (const blob of iter) {
        listado.push({
            name: blob.name.replace(blobPath + "/", ""),
            rutaCompleta: blob.name,
            size: blob.properties.contentLength,
            modifiedAt: blob.properties.lastModified,
            tipo: blob.properties.contentType,
        });
    }
    return listado;
}

/**
 * Descargar archivo de Azure
 */
async function downloadArchivoAzure(ambito, nombreArchivo, id_usuario, id_empresa, tipo) {
    let blobPath;
    if (ambito === "Personal") {
        blobPath = createBlobPathPersonal(ambito, nombreArchivo, id_usuario, id_empresa, tipo);
    }
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    try {
        const downloadResponse = await blockBlobClient.downloadToBuffer();
        return {
            buffer: downloadResponse,
            fileName: path.basename(blobPath),
        };
    } catch (err) {
        if (err.statusCode === 404) return [];
        console.error("Error descargando archivo:", err);
        throw err;
    }
}

/**
 * Genera un URL temporal (SAS) para que el cliente pueda ver o descargar el archivo
 */
async function generarUrlTemporalAzure(
    ambito,
    nombreArchivo,
    id_usuario,
    id_empresa,
    tipo,
    expiracionEnMinutos = 60,
    idProyecto,
    idOt
) {

    let blobPath;
    if (ambito === "Personal") {
        blobPath = createBlobPathPersonal(ambito, nombreArchivo, id_usuario, id_empresa, tipo);
    } else {
        blobPath = createBlobPathEmpresa(ambito, nombreArchivo, idProyecto, idOt, id_empresa, tipo);
    }
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    // Credenciales de cuenta necesarias para generar SAS
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

    // Generar SAS con headers correctos
    const sasOptions = {
        containerName: CONTAINER_NAME,
        blobName: blobPath,
        permissions: BlobSASPermissions.parse("r"), // solo lectura
        startsOn: new Date((new Date).getTime() - 5 * 60 * 1000),
        expiresOn: new Date(Date.now() + expiracionEnMinutos * 60 * 1000),
        contentDisposition: "inline",
        contentType: mime.lookup(nombreArchivo) || "application/octet-stream"
    };

    const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();

    return `${blockBlobClient.url}?${sasToken}`;
}

/**
 * Inserta o actualiza registro en Indice_Documento (igual que antes)
 */
async function registrarOperacionDocumento(ruta, operacion, transaction, empresa, user_id, ambito) {
    try {
        await db.sequelize.query(
            `MERGE Indice_Documento AS target
       USING (SELECT :ruta AS ruta, :empresa AS id_empresa) AS source
       ON target.ruta = source.ruta AND target.id_empresa = source.id_empresa
       WHEN MATCHED THEN
         UPDATE SET operacion = :operacion,
                    user_id = :user_id,
                    tipo = :ambito,
                    sincronizado = 0,
                    fecha_modificacion = GETDATE()
       WHEN NOT MATCHED THEN
         INSERT (ruta, operacion, id_empresa, user_id, tipo, sincronizado, fecha_modificacion)
         VALUES (:ruta, :operacion, :empresa, :user_id, :ambito, 0, GETDATE());`,
            {
                replacements: { ruta, operacion, empresa, user_id, ambito },
                type: db.sequelize.QueryTypes.INSERT,
                transaction,
            }
        );
        return true;
    } catch (error) {
        console.error(`Error registrando operación (${operacion}):`, error);
        throw error;
    }
}


async function obtenerPrimerBlobEmpresa(ambito, idProyecto, idOT, id_empresa, tipo) {
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    let prefix;

    if (tipo === "OT") {
        prefix = createBlobPathEmpresa(ambito, null, idProyecto, idOT, id_empresa, "OT") + "/";
    } else {
        prefix = createBlobPathEmpresa(ambito, null, idProyecto, null, id_empresa, "General") + "/";
    }

    const iter = containerClient.listBlobsFlat({ prefix });
    for await (const blob of iter) {
        return blob.name.split("/").pop(); // devolvemos solo el nombre del archivo
    }

    return null; // no hay archivos
}

/**
 * Obtiene el primer archivo dentro de una carpeta en Azure Blob Storage
 */
async function obtenerPrimerArchivo(ambito, idProyecto, idOT, id_empresa, tipo) {
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

    let prefix;
    if (tipo === "OT") {
        prefix = createBlobPathEmpresa(ambito, null, idProyecto, idOT, id_empresa, "OT") + "/";
    } else {
        prefix = createBlobPathEmpresa(ambito, null, idProyecto, null, id_empresa, "General") + "/";
    }

    const iter = containerClient.listBlobsFlat({ prefix });
    for await (const blob of iter) {
        return blob.name.split("/").pop(); // devolvemos solo el nombre del archivo
    }

    return null; // no hay archivos
}

module.exports = {
    uploadToAzure,
    deleteArchivoAzure,
    listadoArchivosAzure,
    downloadArchivoAzure,
    generarUrlTemporalAzure,
    obtenerPrimerBlobEmpresa,
    obtenerPrimerArchivo
};