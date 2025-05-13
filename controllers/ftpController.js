const {
  listadoArchivos,
  uploadToFtp,
  eliminarArchivo,
  descargarArchivo,
} = require("../models/ftpModel");
const mime = require("mime-types");

const obtenerListadoFtp = async (req, res) => {
  const { id, empresa } = req.user;
  const { tipo } = req.query;

  try {
    const listado = await listadoArchivos(id, empresa, tipo);
    return res.status(200).json(listado);
  } catch (error) {
    if(error.code === 550) console.log("Si entra aqui")
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

const subirArchivoFtp = async (req, res) => {
  const { nombre, tipo } = req.body;
  const { archivo } = req.files;
  const { id, empresa } = req.user;

  try {
    await uploadToFtp(nombre, archivo, id, empresa, tipo);
    res.json({ message: "Archivo subido correctamente." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const eliminarArchivoFTP = async (req, res) => {
  const { ruta } = req.body;
  const { id, empresa } = req.user;
  const { tipo } = req.query;

  try {
    await eliminarArchivo(ruta, id, empresa, tipo);
    res.json({ message: "Archivo eliminado correctamente." });
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
};
