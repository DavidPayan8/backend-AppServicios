const path = require("path");
const AdmZip = require("adm-zip");
const { Writable } = require("stream");
const stream = require("stream");
const ftpPool = require("./pool/ftpPool");
const FTP_CONFIG = require("../../config/ftpConfig");

// Crear ruta dinámica
const createPath = (ambito, nombreArchivo, id, id_empresa, tipo) => {
  const dbname = process.env.DB_NAME;
  const basePath = FTP_CONFIG.BASE_PATH;

  if (ambito === 'Empresa') {
    if (!nombreArchivo) {
      return `${basePath}/${dbname}/${id_empresa}/${ambito}/${tipo}/${id}`;
    }
    return `${basePath}/${dbname}/${id_empresa}/${ambito}/${tipo}/${id}/${nombreArchivo}`;
  }

  // Ruta estándar para otros ambitos
  if (!nombreArchivo) {
    return `${basePath}/${dbname}/${id_empresa}/${ambito}/${id}/${tipo}`;
  }

  return `${basePath}/${dbname}/${id_empresa}/${ambito}/${id}/${tipo}/${nombreArchivo}`;
};


async function uploadToFtp(ambito, archivos, id_usuario, id_empresa, tipo) {
  // Aseguramos que siempre sea un array
  const files = Array.isArray(archivos) ? archivos : [archivos];

  let client;
  try {
    client = await ftpPool.getClient();

    for (const file of files) {
      // Validación básica
      if (!file || !Buffer.isBuffer(file.buffer)) {
        throw new Error(`El archivo ${file?.filename} no es un Buffer válido`);
      }

      // Creamos la carpeta si no existe
      const rutaComprobar = createPath(ambito, "", id_usuario, id_empresa, tipo);
      await client.ensureDir(rutaComprobar);

      const extension = path.extname(file.filename).toLowerCase();

      if (extension === ".zip") {
        // Procesar contenido del ZIP
        const zip = new AdmZip(file.buffer);
        const zipEntries = zip.getEntries();

        for (const entry of zipEntries) {
          if (!entry.isDirectory) {
            const fileName = path.basename(entry.entryName);
            const fileBuffer = entry.getData();

            const archivoStream = new stream.PassThrough();
            archivoStream.end(fileBuffer);

            const rutaDestino = createPath(ambito, fileName, id_usuario, id_empresa, tipo);
            await client.uploadFrom(archivoStream, rutaDestino);

            if (process.env.NODE_ENV === "development") {
              console.log(`Archivo del ZIP subido a: ${rutaDestino}`);
            }
          }
        }
      } else {
        // Subida normal
        const archivoStream = new stream.PassThrough();
        archivoStream.end(file.buffer);

        const rutaDestino = createPath(ambito, file.filename, id_usuario, id_empresa, tipo);
        await client.uploadFrom(archivoStream, rutaDestino);

        if (process.env.NODE_ENV === "development") {
          console.log(`Archivo subido correctamente a: ${rutaDestino}`);
        }
      }
    }
  } catch (error) {
    console.error(`Error al subir archivo al servidor FTP:`, error);
    throw error;
  } finally {
    if (client) ftpPool.releaseClient(client);
  }
}



// Eliminar archivo del FTP usando pool
async function eliminarArchivo(ambito, nombreArchivo, id_usuario, id_empresa, tipo) {
  const rutaArchivo = createPath(ambito, nombreArchivo, id_usuario, id_empresa, tipo);

  let client;
  try {
    client = await ftpPool.getClient();
    await client.remove(rutaArchivo);
  } catch (err) {
    console.error(`Error al eliminar archivo en el FTP (${rutaArchivo}):`, err);
    throw err;
  } finally {
    if (client) ftpPool.releaseClient(client);
  }
}

// Listar archivos en FTP usando pool
const listadoArchivos = async (ambito, id_usuario, id_empresa, tipo) => {
  console.log("DEBUG >> listadoArchivos llamado con:", {
    ambito,
    id_usuario,
    id_empresa,
    tipo,
  });

  const ruta = createPath(ambito, "", id_usuario, id_empresa, tipo);

  let client;
  try {
    client = await ftpPool.getClient();
    const listado = await client.list(ruta);
    console.log(`Listado de archivos en FTP (${ruta}):`, listado);
    return listado;
  } catch (err) {
    // Ruta no encontrada
    if (err.code === 550) {
      return [];
    }
    console.error(`Error al listar archivos en FTP (${ruta}):`, err);
    throw err;
  } finally {
    if (client) ftpPool.releaseClient(client);
  }
};

// Descargar archivo del FTP usando pool
const descargarArchivo = async (
  ambito,
  nombreArchivo,
  id_usuario,
  id_empresa,
  tipo
) => {
  const ruta = createPath(ambito, nombreArchivo, id_usuario, id_empresa, tipo);

  let client;
  try {
    client = await ftpPool.getClient();

    const writableBuffer = [];
    const writable = new Writable({
      write(chunk, encoding, callback) {
        writableBuffer.push(chunk);
        callback();
      },
      final(callback) {
        callback();
      },
    });

    await client.downloadTo(writable, ruta);

    return {
      buffer: Buffer.concat(writableBuffer),
      fileName: path.basename(ruta),
    };
  } catch (error) {
    console.error(`Error al descargar archivo desde FTP (${ruta}):`, error);
    throw new Error("Error al descargar archivo: " + error.message);
  } finally {
    if (client) ftpPool.releaseClient(client);
  }
};

module.exports = {
  listadoArchivos,
  uploadToFtp,
  eliminarArchivo,
  descargarArchivo,
};
