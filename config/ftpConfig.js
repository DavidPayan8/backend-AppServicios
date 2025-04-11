/* FTP_HOST="cp7073.webempresa.eu"
FTP_USER="desarrollo@kongsoftware.es"
FTP_PASSWORD="?II14$!*2ef2+aQrH"
FTP_SECURE=true
BASE_PATH="/Pruebas" */

const ftp = {
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    secure: process.env.FTP_SECURE === "true",
    secureOptions: { rejectUnauthorized: false },
    BASE_PATH: process.env.BASE_PATH,
  };
  
  module.exports = ftp;
  