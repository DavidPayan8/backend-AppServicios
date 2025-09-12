const {
  listadoArchivos,
  uploadToFtp,
  eliminarArchivo,
  descargarArchivo,
} = require("../Model/others/ftpModel");
const { enviarAdjuntosOt } = require('./emailController')
const db = require("../Model");
const mime = require("mime-types");

const obtenerListadoFtp = async (req, res) => {
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

    const listado = await listadoArchivos(ambito, identification, empresa, tipo);
    return res.status(200).json(listado);
  } catch (error) {
    console.error("Error al obtener listado FTP:", error);
    res.status(500).json({ error: "Error al obtener listado de archivos." });
  }
};

const descargarArchivoFTP = async (req, res) => {
  const { nombreArchivo, tipo, ambito, identify } = req.query;
  const { id, empresa } = req.user;

  let identification = null;

  if (identify && identify !== 0) {
    identification = Number(identify);
  } else {
    identification = id;
  }

  try {
    const { buffer, fileName } = await descargarArchivo(
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
      res.status(500).send("Error al procesar la descarga.");
  }
};

const visualizarArchivoFTP = async (req, res) => {
  const { nombreArchivo, tipo, ambito, identify } = req.query;
  const { id, empresa } = req.user;

  let identification = null;

  if (identify && identify !== 0) {
    identification = Number(identify);
  } else {
    identification = id;
  }

  try {
    const { buffer, fileName } = await descargarArchivo(
      ambito,
      nombreArchivo,
      id,
      empresa,
      tipo,
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
    let extensionCara = null;
    let extAnverso = null

    if (!archivos || Object.keys(archivos).length === 0) {
      return res.status(400).json({ error: 'No se recibió ningún archivo.' });
    }

    // Subir cara
    if (archivos.cara) {
      const archivoCara = Array.isArray(archivos.cara) ? archivos.cara[0] : archivos.cara;
      extensionCara = archivoCara.filename.substring(archivoCara.filename.lastIndexOf('.'));
      const nombreCara = `cara${extensionCara}`;
      await uploadToFtp(nombreCara, archivoCara, id_usuario, empresa, tipo);
    }

    // Subir anverso
    if (archivos.anverso) {
      const archivoAnverso = Array.isArray(archivos.anverso) ? archivos.anverso[0] : archivos.anverso;
      extensionAnverso = archivoAnverso.filename.substring(archivoAnverso.filename.lastIndexOf('.'));
      const nombreAnverso = `anverso${extensionAnverso}`;
      await uploadToFtp(nombreAnverso, archivoAnverso, id_usuario, empresa, tipo);
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


const subirArchivoFtp = async (req, res) => {
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
    await uploadToFtp(ambito, archivos, identification, empresa, tipo);
    if (tipo === 'OT') await enviarAdjuntosOt({ identify, empresa, archivos, accion: 'create', user: id });

    res.status(201).json({ message: "Archivo subido correctamente." });
  } catch (error) {
    console.log("Fallo al subir archivo:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const eliminarArchivoFTP = async (req, res) => {
  const { empresa, id } = req.user;
  const { nombre, tipo, identify, ambito } = req.body;

  let identification = null;

  if (identify && identify !== 0) {
    identification = Number(identify);
  } else {
    identification = id;
  }

  try {
    await eliminarArchivo(ambito, nombre, identification, empresa, tipo);
    if (tipo === 'OT') await enviarAdjuntosOt({ identify, empresa, accion: 'delete', user: id });

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
