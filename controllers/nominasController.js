const fs = require('fs');
const db = require('../Model');
const User = db['USUARIOS'];
const { uploadToAzure } = require('../Model/others/blobStorageModel');
const { TIPOS_DOCUMENTO } = require('../shared/tiposDocumento');

// Valores por defecto para subida masiva de nóminas
const DEFAULTS = {
  ambito: 'Personal',
  tipo: TIPOS_DOCUMENTO.NOMINAS,
};

// Regex para extraer DNI/NIE del nombre de archivo
const DNI_REGEX = /(\d{8}[TRWAGMYFPDXBNJZSQVHLCKE])[_\.]|(\d{8}[TRWAGMYFPDXBNJZSQVHLCKE])/i;

/**
 * Normaliza el ámbito: primera letra mayúscula, resto minúsculas
 * Ej: "personal" -> "Personal", "EMPRESA" -> "Empresa"
 */
const normalizarAmbito = (raw) =>
  raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();

/**
 * Extrae el DNI del nombre de un archivo.
 * Soporta formatos: "nombre12345678Z.pdf", "12345678Z_algo.pdf", etc.
 */
const extraerDniDeNombre = (filename) => {
  const match = filename.match(DNI_REGEX);
  if (!match) return null;
  return (match[1] || match[2]).toUpperCase();
};

const uploadPdfs = async (req, res) => {
  try {
    const files = req.files || [];
    const ambito = normalizarAmbito(req.body.ambito || DEFAULTS.ambito);
    const tipo = req.body.tipo || DEFAULTS.tipo;
    const id_empresa = req.user.empresa;

    const resultados = [];

    for (const file of files) {
      const dni = extraerDniDeNombre(file.originalname);
      if (!dni) {
        return res.status(400).json({ error: `DNI no encontrado en ${file.originalname}` });
      }

      const user = await User.findOne({ where: { DNI: dni } });
      if (!user) {
        return res.status(400).json({ error: `Usuario no encontrado con DNI: ${dni}` });
      }

      const buffer = fs.readFileSync(file.path);
      const archivoAzure = { buffer, filename: file.originalname };

      await uploadToAzure(ambito, archivoAzure, user.id, id_empresa, tipo);

      resultados.push({ dni, userId: user.id });

      // Limpia el archivo temporal
      fs.unlinkSync(file.path);
    }

    res.json({ success: true, message: `${resultados.length}/${files} PDFs procesados correctamente`, resultados });
  } catch (error) {
    console.error('Error en uploadPdfs:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { uploadPdfs };
