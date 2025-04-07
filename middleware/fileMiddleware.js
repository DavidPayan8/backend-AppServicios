const busboy = require('busboy');

const uploadMiddleware = (req, res, next) => {
  const bb = busboy({ headers: req.headers });
  const files = {};
  const fields = {};

  bb.on('file', (fieldname, file, filename, encoding, mimetype) => {
    const chunks = [];

    file.on('data', (data) => {
      chunks.push(data);
    });

    file.on('end', () => {
      const fileBuffer = Buffer.concat(chunks);
      files[fieldname] = {
        filename,
        encoding,
        mimetype,
        buffer: fileBuffer,
      };
    });
  });

  bb.on('field', (fieldname, val) => {
    fields[fieldname] = val;
  });

  bb.on('finish', () => {
    req.body = fields;
    req.files = files;
    next();
  });

  req.pipe(bb);
};

module.exports = uploadMiddleware;
