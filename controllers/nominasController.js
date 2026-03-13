const fs = require('fs');
const path = require('path');
const db = require('../Model');
const User = db['USUARIOS']; 
const Nomina = db['Nomina'];
const { uploadToAzure } = require('../Model/others/blobStorageModel');

const uploadPdfs = async (req, res) => {
  try {
    console.log('🚀 uploadPdfs INICIO');
    console.log('📦 req.body:', req.body);
    console.log('📁 req.files:', req.files);
    console.log('📦 req.file:', req.file);
    const files = req.files || []; // Array de PDFs validados desde busboy
    const resultados = [];

    for (let file of files) {
      // Extraer DNI del nombre: asume título en formato "DNI_12345678Z.pdf" o "12345678Z.pdf"
      const dniMatch = file.originalname.match(/(\d{8}[TRWAGMYFPDXBNJZSQVHLCKE])[_\.]|(\d{8}[TRWAGMYFPDXBNJZSQVHLCKE])/i);
      if (!dniMatch) {
        return res.status(400).json({ error: `DNI no encontrado en ${file.originalname}` });
      }
      const dni = (dniMatch[1] || dniMatch[2]).toUpperCase();

      // Buscar user por DNI con Sequelize
      const user = await User.findOne({ where: { DNI: dni } });
      if (!user) {
        return res.status(400).json({ error: `Usuario no encontrado con DNI: ${dni}` });
      }

      // Leer el archivo del disco y construir el objeto que uploadToAzure espera
      const buffer = fs.readFileSync(file.path);
      

      const ambito = req.body.ambito ||'Personal';
      const tipo = req.body.tipo || 'nomina';
      const id_empresa = req.body.id_empresa; // viene desde el front

      console.log('📝 Datos form:', { ambito, tipo, id_empresa });

    
      const archivoAzure = { buffer, filename: file.originalname };
      await uploadToAzure(ambito, archivoAzure, user.id, id_empresa, tipo);
      
       await Nomina.create({
        IdUsuario: user.id,
        ambito: req.body.ambito || 'personal',
        tipo: req.body.tipo || 'nomina',
        nombreOriginal: file.originalname,
        Ruta: '', //Aqui no iria una ruta?
        Tamano: buffer.length
      });  // actua en db
      
      
      resultados.push({ dni, userId: user.id});

      // Borra temp después de procesar
      fs.unlinkSync(file.path);
    }

    res.json({ success: true, message: 'PDFs procesados correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { uploadPdfs };
