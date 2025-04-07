

const {
  listadoArchivos,
  uploadToFtp,
  eliminarArchivo,
  descargarArchivo,
} = require("../models/ftpModel");

const obtenerListadoFtp = async (req, res) => {
  const { id, empresa } = req.user;
  const { tipo } = req.query;
  try {
    return res.status(200).json(await listadoArchivos(id, empresa, tipo));
  } catch (error) {
    console.log(error);
  }
};

const descargarArchivoFTP = async (req, res) => {
  const { nombreArchivo, tipo } = req.query;
  const {id, empresa,} = req.user;
  try {
    const { buffer, fileName } = await descargarArchivo(
      nombreArchivo,
      id,
      empresa,
      tipo
    );

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.status(200).send(buffer);

  } catch (error) {
    console.error("Fallo en el controlador de descarga:", error);
    if (!res.headersSent) {
      res.status(500).send("Error al procesar la descarga.");
    }
  }
};

const subirArchivoFtp = async (req, res) => {
  const { nombre, tipo } = req.body;
  const { archivo } = req.files;
  const { id, empresa } = req.user;
  console.log("En controller", req.user);
  try {
    await uploadToFtp(nombre, archivo, id, empresa, tipo);
    res.json({ message: "Archivo subido correctamente." });
  } catch (error) {
    console.error("Subida fallida:", error.message);
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
    console.error("Subida fallida:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  obtenerListadoFtp,
  subirArchivoFtp,
  eliminarArchivoFTP,
  descargarArchivoFTP,
};
