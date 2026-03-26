const Busboy = require('busboy');
const fs = require('fs');
const path = require('path');

const uploadPdfMiddleware = (req, res, next) => {
  console.log('🚀 Busboy:', req.url);
  
  const busboy = Busboy({ headers: req.headers });
  const files = [];
  const fields = {};
  let responded = false;  // ← ANTI-DUPLICADA

  busboy.on('field', (fieldname, val) => {
    fields[fieldname] = val;
  });

  busboy.on('file', (fieldname, file, info) => {
  const { filename, encoding, mimeType } = info;
    console.log('📄 FILE:', fieldname, filename.toString(), mimeType);
    
    if (fieldname !== 'pdfs') {
      console.log('❌ Skip fieldname:', fieldname);
      return file.resume();
    }

    const filenameStr = filename.toString();
    if (!filenameStr.toLowerCase().endsWith('.pdf')) {
      console.log('❌ No PDF:', filenameStr);
      return file.resume();
    }

    const filePath = path.join('uploads','temp', `${Date.now()}-${filenameStr}`);
    const fstream = fs.createWriteStream(filePath);

    let size = 0;
    const MAX_SIZE = 10 * 1024 * 1024;

    file.on('data', (data) => {
      size += data.length;
      if (size > MAX_SIZE) {
        console.log('❌ Too big');
        fstream.destroy();
      }
    });

    file.pipe(fstream);
    files.push({ path: filePath, originalname: filenameStr });
  });

  busboy.on('finish', () => {
    console.log('✅ FINISH files:', files.length);
    req.body = fields;
    req.files = files;
    
    if (files.length === 0) {
      if (!responded) {
        responded = true;
        return res.status(400).json({ error: 'No PDFs encontrados' });
      }
    }
    next();
  });

  busboy.on('error', (err) => {
    if (!responded) {
      responded = true;
      console.log('💥 ERROR:', err);
      res.status(400).json({ error: err.message });
    }
  });

  req.pipe(busboy);
};

module.exports = uploadPdfMiddleware;
