const DB_NAME="APPFICHAJE"
const DB_USER="Hugo"
const DB_PASSWORD="SQLKong1972."
const DB_SERVER="85.215.191.245"
const DB_HOST="localhost"

const config = {
    user: DB_USER,
    password:DB_PASSWORD,
    server: DB_SERVER,
    database: DB_NAME,
    options: {
      encrypt: true, 
      enableArithAbort: true,  
      trustServerCertificate: true 
    }
  };
  
  module.exports = config;
  