/* const DB_NAME="APPFICHAJE"
const DB_USER="Kong"
const DB_PASSWORD="SQLKong1972."
const DB_SERVER="85.215.191.245" */

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
      encrypt: true, 
      enableArithAbort: true,  
      trustServerCertificate: true 
    }
  };
  
  module.exports = config;
  