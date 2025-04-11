const path = require("path");
const { Writable } = require("stream");
const ftpPool = require("./pool/ftpPool");
const FTP_CONFIG = require("../config/ftpConfig");

// Declarar ruta
const createPath = (nombreArchivo, id_usuario, id_empresa, tipo) => {
  const dbname = process.env.DB_NAME;
  const basePath = FTP_CONFIG.BASE_PATH;

  if (!nombreArchivo) {
    return `${basePath}/${dbname}/${id_empresa}/Personal/${id_usuario}/${tipo}`;
  }
  return `${basePath}/${dbname}/${id_empresa}/Personal/${id_usuario}/${tipo}/${nombreArchivo}`;
};

// Subir archivo al FTP usando el pool de conexiones
async function uploadToFtp(
  nombreArchivo,
  archivo,
  id_usuario,
  id_empresa,
  tipo
) {
  const rutaComprobar = createPath("", id_usuario, id_empresa, tipo);
  const rutaDestino = createPath(nombreArchivo, id_usuario, id_empresa, tipo);

  const client = await ftpPool.getClient();

  try {
    if (!(archivo.buffer instanceof Buffer)) {
      throw new Error("El archivo no es un Buffer válido");
    }

    const archivoStream = new stream.PassThrough();
    archivoStream.end(archivo.buffer);

    await client.ensureDir(rutaComprobar);
    await client.uploadFrom(archivoStream, rutaDestino);
  } catch (error) {
    console.error("Error al subir archivo al servidor FTP:", error);
    throw error;
  } finally {
    ftpPool.releaseClient(client);
  }
}

// Eliminar archivo del FTP usando el pool de conexiones
async function eliminarArchivo(nombreArchivo, id_usuario, id_empresa, tipo) {
  const rutaArchivo = createPath(nombreArchivo, id_usuario, id_empresa, tipo);
  const client = await ftpPool.getClient(); // Obtener cliente del pool

  try {
    await client.remove(rutaArchivo);
    console.log(`Archivo ${rutaArchivo} eliminado.`);
  } catch (err) {
    console.error("Error al eliminar archivo en el FTP:", err);
    throw err;
  } finally {
    ftpPool.releaseClient(client); // Liberar el cliente para reutilizar
  }
}

// Listar archivos en el FTP con el pool de conexiones
const listadoArchivos = async (id_usuario, id_empresa, tipo) => {
  const ruta = createPath("", id_usuario, id_empresa, tipo);

  const client = await ftpPool.getClient(); // Obtener cliente del pool

  try {
    const listado = await client.list(ruta);
    console.log("Listando archivos desde FTP...");
    return listado;
  } catch (err) {
    console.log("Error de conexión FTP:", err);
    throw err;
  } finally {
    ftpPool.releaseClient(client); // Liberar el cliente para reutilizar
  }
};

// Descargar archivo desde FTP usando el pool de conexiones
const descargarArchivo = async (nombreArchivo, id_usuario, id_empresa, tipo) => {
  const ruta = createPath(nombreArchivo, id_usuario, id_empresa, tipo);
  const client = await ftpPool.getClient(); // Obtener cliente del pool

  try {
    const writableBuffer = [];
    const writable = new Writable({
      write(chunk, encoding, callback) {
        writableBuffer.push(chunk);
        callback();
      },
    });

    await client.downloadTo(writable, ruta);

    return {
      buffer: Buffer.concat(writableBuffer),
      fileName: path.basename(ruta),
    };
  } catch (error) {
    console.error("Error al descargar archivo:", error);
    throw new Error("Error al descargar archivo: " + error.message);
  } finally {
    ftpPool.releaseClient(client);
  }
};

module.exports = {
  listadoArchivos,
  uploadToFtp,
  eliminarArchivo,
  descargarArchivo,
};
