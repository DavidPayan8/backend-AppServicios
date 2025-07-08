const path = require("path");
const AdmZip = require("adm-zip");
const { Writable } = require("stream");
const stream = require("stream");
const ftpPool = require("./pool/ftpPool");
const FTP_CONFIG = require("../../config/ftpConfig");

// Crear ruta dinámica
const createPath = (nombreArchivo, id_usuario, id_empresa, tipo) => {
  const dbname = process.env.DB_NAME;
  const basePath = FTP_CONFIG.BASE_PATH;

  if (!nombreArchivo) {
    return `${basePath}/${dbname}/${id_empresa}/Personal/${id_usuario}/${tipo}`;
  }

  return `${basePath}/${dbname}/${id_empresa}/Personal/${id_usuario}/${tipo}/${nombreArchivo}`;
};

async function uploadToFtp(nombreArchivoZip, archivo, id_usuario, id_empresa, tipo) {
  const rutaComprobar = createPath("", id_usuario, id_empresa, tipo);

  let client;
  try {
    if (!(archivo.buffer instanceof Buffer)) {
      throw new Error("El archivo no es un Buffer válido");
    }

    client = await ftpPool.getClient();

    await client.ensureDir(rutaComprobar);

    const extension = path.extname(nombreArchivoZip).toLowerCase();

    if (extension === '.zip') {
      const zip = new AdmZip(archivo.buffer);
      const zipEntries = zip.getEntries();

      for (const entry of zipEntries) {
        if (!entry.isDirectory) {
          const fileName = path.basename(entry.entryName); // nombre del archivo plano
          const fileBuffer = entry.getData();

          const archivoStream = new stream.PassThrough();
          archivoStream.end(fileBuffer);

          const rutaDestino = createPath(fileName, id_usuario, id_empresa, tipo);

          await client.uploadFrom(archivoStream, rutaDestino);

          if (process.env.NODE_ENV === "development") {
            console.log(`Archivo del ZIP subido a: ${rutaDestino}`);
          }
        }
      }
    } else {
      // No es zip, sube el archivo normal
      const archivoStream = new stream.PassThrough();
      archivoStream.end(archivo.buffer);

      const rutaDestino = createPath(nombreArchivoZip, id_usuario, id_empresa, tipo);
      await client.uploadFrom(archivoStream, rutaDestino);

      if (process.env.NODE_ENV === "development") {
        console.log(`Archivo subido correctamente a: ${rutaDestino}`);
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
async function eliminarArchivo(nombreArchivo, id_usuario, id_empresa, tipo) {
  const rutaArchivo = createPath(nombreArchivo, id_usuario, id_empresa, tipo);

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
const listadoArchivos = async (id_usuario, id_empresa, tipo) => {
  const ruta = createPath("", id_usuario, id_empresa, tipo);

  let client;
  try {
    client = await ftpPool.getClient();
    const listado = await client.list(ruta);
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
  nombreArchivo,
  id_usuario,
  id_empresa,
  tipo
) => {
  const ruta = createPath(nombreArchivo, id_usuario, id_empresa, tipo);

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
