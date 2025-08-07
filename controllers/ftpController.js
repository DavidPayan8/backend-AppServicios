const {
  listadoArchivos,
  uploadToFtp,
  eliminarArchivo,
  descargarArchivo,
} = require("../Model/others/ftpModel");
const mime = require("mime-types");

const obtenerListadoFtp = async (req, res) => {
  const { id, empresa } = req.user;
  const { tipo } = req.query;

  try {
    console.log("[BACK] llamada a listadoArchivos");
    const listado = await listadoArchivos(id, empresa, tipo);
    return res.status(200).json(listado);
  } catch (error) {
    console.error("Error al obtener listado FTP:", error);
    res.status(500).json({ error: "Error al obtener listado de archivos." });
  }
};

const descargarArchivoFTP = async (req, res) => {
  const { nombreArchivo, tipo } = req.query;
  const { id, empresa } = req.user;

  try {
    const { buffer, fileName } = await descargarArchivo(
      nombreArchivo,
      id,
      empresa,
      tipo
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
      res.status(500).send("Error al procesar la descarga.");
  }
};

const visualizarArchivoFTP = async (req, res) => {
  const { nombreArchivo, tipo } = req.query;
  const { id, empresa } = req.user;

  try {
    const { buffer, fileName } = await descargarArchivo(
      nombreArchivo,
      id,
      empresa,
      tipo
    );
    res.setHeader(
      "Content-Type",
      mime.lookup(fileName) || "application/octet-stream"
    );
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
    res.status(200).send(buffer);
  } catch (error) {
    console.error("Fallo en visualización:", error);
    if (!res.headersSent)
      res.status(500).send("Error al procesar la descarga.");
  }
};

const subirTarjetaContacto = async (req, res) => {
  const { empresa } = req.user;
  const id_usuario = req.user.id;
  const tipo = 'contacto';

  try {
    const archivos = req.files;

    if (!archivos || Object.keys(archivos).length === 0) {
      return res.status(400).json({ error: 'No se recibió ningún archivo.' });
    }

    // Subir cara
    if (archivos.cara) {
      const archivoCara = Array.isArray(archivos.cara) ? archivos.cara[0] : archivos.cara;
      const extensionCara = archivoCara.filename.substring(archivoCara.filename.lastIndexOf('.'));
      const nombreCara = `cara${extensionCara}`;
      await uploadToFtp(nombreCara, archivoCara, id_usuario, empresa, tipo);
    }

    // Subir anverso
    if (archivos.anverso) {
      const archivoAnverso = Array.isArray(archivos.anverso) ? archivos.anverso[0] : archivos.anverso;
      const extensionAnverso = archivoAnverso.filename.substring(archivoAnverso.filename.lastIndexOf('.'));
      const nombreAnverso = `anverso${extensionAnverso}`;
      await uploadToFtp(nombreAnverso, archivoAnverso, id_usuario, empresa, tipo);
    }

    res.status(200).json({ message: 'Tarjeta de contacto subida correctamente.' });
  } catch (error) {
    console.error('Error al subir tarjeta de contacto:', error);
    res.status(500).json({ error: error.message });
  }
};


const subirArchivoFtp = async (req, res) => {
  const { nombre, tipo, id_usuario } = req.body;
  const { archivo } = req.files;
  const { empresa } = req.user;

  try {
    await uploadToFtp(nombre, archivo, id_usuario, empresa, tipo);
    res.json({ message: "Archivo subido correctamente." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const eliminarArchivoFTP = async (req, res) => {
  const { empresa } = req.user;
  const { nombre, tipo, id_usuario } = req.body;

  try {
    await eliminarArchivo(nombre, id_usuario, empresa, tipo);
    res.status(200).json({ message: "Archivo eliminado correctamente." });
  } catch (error) {
    console.error("Fallo al eliminar archivo:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  obtenerListadoFtp,
  subirArchivoFtp,
  eliminarArchivoFTP,
  descargarArchivoFTP,
  visualizarArchivoFTP,
  subirTarjetaContacto
};
