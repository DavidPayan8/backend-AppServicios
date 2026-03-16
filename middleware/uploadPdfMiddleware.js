const Busboy = require('busboy');
const fs = require('fs');
const path = require('path');

const dniValidator = require('../utils/dniValidator.js');  

const uploadPdfMiddleware = (req, res, next) => {

  const busboy = Busboy({ headers: req.headers });
  const files = [];
  let responded = false;  // <--- flag de anti-duplicadas 

  req.body = req.body || {}; //  req.body esté inicializado: importate

  busboy.on('field', (fieldname, val) => {
    req.body[fieldname] = val;
  });

  busboy.on('file', (fieldname, file, info) => {
    const { filename, encoding, mimeType } = info;
    console.log('📄 FILE:', fieldname, filename.toString(), mimeType);
    
    if (fieldname !== 'pdfs') {
      console.log('❌ Field name inválido: debe ser "pdfs"');
      return file.resume();
    }

    const filenameStr = filename.toString();  
    const filenameLower = filenameStr.toLowerCase();  
    
    if (!filenameLower.endsWith('.pdf')) { 
      console.log('❌ El/los archivos subidos deben tener formato PDF');
      return file.resume();
    }

    
    const dniMatch = filenameStr.match(/[_-]([0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE])/i);
    if (!dniMatch) {
      console.log('❌ No se encuentra DNI válido en:', filenameStr);
      return file.resume();
    }
    
    const dniExtraido = dniMatch[1].toUpperCase();
    
    // validador de dni extraido del titulo
    if (!dniValidator(dniExtraido)) {  
      console.log('❌ El DNI introducido no es válido:', dniExtraido);
      return file.resume();
    } else {
      console.log('✅ Validacion de dni superada correctamente:', dniExtraido);
      req.dni = dniExtraido;  // no es necesario pero es buena practica para el controller
    }
    
    const filePath = path.join('uploads','temp', `${Date.now()}-${filenameStr}`);
    const fstream = fs.createWriteStream(filePath);

    let size = 0;
    const MAX_SIZE = 10 * 1024 * 1024;

    file.on('data', (data) => {
      size += data.length;
      if (size > MAX_SIZE) {
        console.log('❌ Archivo demasiado grande: el peso máximo son 10MB');
        fstream.destroy();
      }
    });

    file.pipe(fstream);
    files.push({ path: filePath, originalname: filenameStr });
  });

};

module.exports = uploadPdfMiddleware;
