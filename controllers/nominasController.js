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
    console.log('🚀 uploadPdfs INICIO');
    console.log('📦 req.body:', req.body);
    console.log('📁 req.files:', req.files);
    const files = req.files || []; // Array de PDFs validados desde busboy
    const resultados = [];
    const errores = [];

    const ambito = req.body.ambito || 'Personal';
    const tipo = req.body.tipo || 'nominas';
    const id_empresa = req.user.empresa;

    console.log('📝 Datos form:', { ambito, tipo, id_empresa });

    for (let file of files) {
      try {
        // Extraer DNI del nombre: asume título en formato "DNI_12345678Z.pdf" o "12345678Z.pdf"
        const dniMatch = file.originalname.match(/(\d{8}[TRWAGMYFPDXBNJZSQVHLCKE])[_\.]|(\d{8}[TRWAGMYFPDXBNJZSQVHLCKE])/i);
        if (!dniMatch) {
          throw new Error(`DNI no encontrado en el nombre del archivo: ${file.originalname}`);
        }
        const dni = (dniMatch[1] || dniMatch[2]).toUpperCase();

        // Buscar user por DNI con Sequelize
        const user = await User.findOne({ where: { DNI: dni } });
        if (!user) {
          throw new Error(`Usuario no encontrado con DNI: ${dni}`);
        }

        // Leer el archivo del disco y construir el objeto que uploadToAzure espera
        const buffer = fs.readFileSync(file.path);
        
        const archivoAzure = { buffer, filename: file.originalname };
        await uploadToAzure(ambito, archivoAzure, user.id, id_empresa, tipo);
        
        /* await Nomina.create({ ... }); */
        
        resultados.push({ archivo: file.originalname, dni, userId: user.id, status: 'ok' });
      } catch (err) {
        console.error(`❌ Error procesando ${file.originalname}:`, err.message);
        errores.push({ archivo: file.originalname, error: err.message });
      } finally {
        // Borrar el archivo temporal siempre, tenga error o no
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    if (errores.length > 0 && resultados.length === 0) {
      return res.status(400).json({ success: false, message: 'Fallo al procesar todos los archivos', errores });
    }

    res.json({ 
      success: true, 
      message: 'Procesamiento de PDFs completado', 
      resultados, 
      errores: errores.length > 0 ? errores : undefined 
    });
  } catch (error) {
    console.error('Error en uploadPdfs:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { uploadPdfs };
