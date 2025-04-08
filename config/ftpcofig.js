/* const DB_NAME="APPFICHAJE"
const DB_USER="Kong"
const DB_PASSWORD="SQLKong1972."
const DB_SERVER="85.215.191.245" */

const ftp = {
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    secure: process.env.FTP_SECURE,
  };
  
  module.exports = ftp;
  