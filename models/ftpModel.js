const { Client } = require("basic-ftp");
const path = require("path");
const stream = require("stream");
const { Writable } = require("stream");
const FTP_CONFIG = require("../config/ftpcofig");

// Declarar ruta
const createPath = (nombreArchivo, id_usuario, id_empresa, tipo) => {
  const dbname = process.env.DB_NAME;
  const basePath = FTP_CONFIG.BASE_PATH;

  let filePath;

  if (!nombreArchivo) {
    // Construcción del path final(Personal sujeto a cambios)
    filePath = `${basePath}/${dbname}/${id_empresa}/Personal/${id_usuario}/${tipo}`;
  } else {
    filePath = `${basePath}/${dbname}/${id_empresa}/Personal/${id_usuario}/${tipo}/${nombreArchivo}`;
  }

  return filePath;
};

// Subir archivo al FTP
async function uploadToFtp(
  nombreArchivo,
  archivo,
  id_usuario,
  id_empresa,
  tipo
) {
  const rutaComprobar = createPath("", id_usuario, id_empresa, tipo);
  const rutaDestino = createPath(nombreArchivo, id_usuario, id_empresa, tipo);

  try {
    // Verifica si archivoBuffer es un Buffer
    if (!(archivo.buffer instanceof Buffer)) {
      console.log(archivo.buffer);
      console.error("El archivo no es un Buffer válido");
      return;
    }

    // Convertimos el buffer a un stream para subirlo al FTP
    const archivoStream = new stream.PassThrough();
    archivoStream.end(archivo.buffer); // Aquí el buffer viene directamente de busboy

    const client = new Client();
    await client.access(FTP_CONFIG);

    // Aseguramos que el directorio existe
    await client.ensureDir(rutaComprobar);

    // Subimos el archivo usando el stream
    await client.uploadFrom(archivoStream, rutaDestino);

    client.close();
  } catch (error) {
    console.error("Error al subir el archivo al servidor FTP:", error);
    throw error;
  }
}

// Eliminar archivo del FTP
async function eliminarArchivo(nombreArchivo, id_usuario, id_empresa, tipo) {
  const rutaArchivo = createPath(nombreArchivo, id_usuario, id_empresa, tipo);
  const client = new Client();
  client.ftp.verbose = false;

  try {
    await client.access(FTP_CONFIG);
    await client.remove(rutaArchivo);
    console.log(`Archivo ${rutaArchivo} eliminado.`);
  } catch (err) {
    console.error("Error al eliminar archivo en el FTP:", err);
    throw err;
  } finally {
    client.close();
  }
}

// Listar archivos en el FTP
const listadoArchivos = async (id_usuario, id_empresa, tipo) => {
  const ruta = createPath("", id_usuario, id_empresa, tipo);
  const client = new Client();
  client.ftp.verbose = false;

  try {
    await client.access(FTP_CONFIG);

    return await client.list(ruta);
  } catch (err) {
    console.log("Error de conexión FTP:", err);
    throw error;
  } finally {
    await client.close();
  }
};

const descargarArchivo = async (nombreArchivo, id_usuario, id_empresa, tipo) => {
  const ruta = createPath(nombreArchivo, id_usuario, id_empresa, tipo);
  const client = new Client();

  try {
    await client.access(FTP_CONFIG);

    const writableBuffer = [];
    const writable = new Writable({
      write(chunk, encoding, callback) {
        writableBuffer.push(chunk);
        callback();
      }
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
    client.close();
  }
};

module.exports = {
  listadoArchivos,
  uploadToFtp,
  eliminarArchivo,
  descargarArchivo,
};
