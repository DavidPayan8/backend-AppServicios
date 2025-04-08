const busboy = require("busboy");
const path = require("path");

const ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.pdf',
  '.txt',
  '.xlsx',
  '.xls',
  '.csv',
  '.ppt',
  '.pptx',
];
const ALLOWED_MIME_TYPES = [
  'image/jpeg', // .jpg, .jpeg
  'image/png',  // .png
  'application/pdf', // .pdf
  'text/plain', // .txt
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'text/csv', // .csv
  'application/vnd.ms-powerpoint', // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
];

const uploadMiddleware = (req, res, next) => {
  const bb = busboy({ headers: req.headers });
  const files = {};
  const fields = {};

  bb.on("file", (fieldname, file, filename, encoding, mimetype) => {
    const fileExtension = path.extname(filename.filename).toLowerCase();

    // Verifica si la extensión está permitida
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return res.status(400).send({ message: "Archivo no permitido" });
    }

    // Verifica si el tipo MIME está permitido
    if (!ALLOWED_MIME_TYPES.includes(filename.mimeType)) {
      return res.status(400).send({ message: "Archivo no permitido" });
    }

    const chunks = [];

    file.on("data", (data) => {
      chunks.push(data);
    });

    file.on("end", () => {
      const fileBuffer = Buffer.concat(chunks);
      files[fieldname] = {
        filename,
        encoding,
        mimetype,
        buffer: fileBuffer,
      };
    });
  });

  bb.on("field", (fieldname, val) => {
    fields[fieldname] = val;
  });

  bb.on("finish", () => {
    req.body = fields;
    req.files = files;
    next();
  });

  req.pipe(bb);
};

module.exports = uploadMiddleware;
