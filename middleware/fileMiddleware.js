const busboy = require("busboy");
const path = require("path");
const yauzl = require("yauzl");

const ALLOWED_EXTENSIONS = [
  ".zip",
  ".jpg",
  ".jpeg",
  ".png",
  ".pdf",
  ".txt",
  ".xlsx",
  ".xls",
  ".csv",
  ".ppt",
  ".pptx",
];

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "application/x-zip-compressed",
  "multipart/x-zip",
  "application/octet-stream",
];

const isZipNonEmpty = (buffer) => {
  return new Promise((resolve, reject) => {
    let resolved = false;
    let hasValidEntries = false;

    yauzl.fromBuffer(buffer, { lazyEntries: true }, (err, zipfile) => {
      if (err) return reject(err);

      zipfile.readEntry();

      zipfile.on("entry", (entry) => {
        if (!entry.fileName.endsWith("/")) {
          hasValidEntries = true;
          if (!resolved) {
            resolved = true;
            zipfile.close();
            resolve(true);
          }
        } else {
          zipfile.readEntry();
        }
      });

      zipfile.on("end", () => {
        if (!resolved) {
          resolved = true;
          resolve(hasValidEntries);
        }
      });

      zipfile.on("close", () => {
        if (!resolved) {
          resolved = true;
          resolve(hasValidEntries);
        }
      });

      zipfile.on("error", (e) => {
        if (!resolved) {
          resolved = true;
          reject(e);
        }
      });
    });
  });
};

const uploadMiddleware = (req, res, next) => {
  const bb = busboy({ headers: req.headers });
  const files = {};
  const fields = {};
  const filePromises = [];

  bb.on("file", (fieldname, file, fileInfo) => {
    const { filename, mimetype } = fileInfo;
    const fileExtension = path.extname(filename).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return res
        .status(400)
        .send({ message: "Extensión de archivo no permitida" });
    }


    if (mimetype && !ALLOWED_MIME_TYPES.includes(mimetype)) {
      return res.status(400).send({ message: "Tipo MIME no permitido" });
    }

    const chunks = [];

    file.on("data", (data) => chunks.push(data));

    const filePromise = new Promise((resolve, reject) => {
      file.on("end", async () => {
        try {
          const buffer = Buffer.concat(chunks);

          if (fileExtension === ".zip") {
            const isValidZip = await isZipNonEmpty(buffer);
            if (!isValidZip) {
              return res.status(400).send({
                message:
                  "El archivo ZIP está vacío o solo contiene carpetas vacías",
              });
            }
          }

          files[fieldname] = {
            filename,
            mimetype,
            buffer,
          };
          resolve();
        } catch (err) {
          reject(err);
        }
      });

      file.on("error", reject);
    });

    filePromises.push(filePromise);
  });

  bb.on("field", (fieldname, val) => {
    fields[fieldname] = val;
  });

  bb.on("finish", async () => {
    try {
      await Promise.all(filePromises);
      req.body = fields;
      req.files = files;
      next();
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  });

  req.pipe(bb);
};

module.exports = uploadMiddleware;
