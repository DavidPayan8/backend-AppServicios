console.log(process.env.DB_NAME,process.env.DB_USER,process.env.DB_PASSWORD,process.env.DB_SERVER)

const config = {
    user: String(process.env.DB_USER),
    password: String(process.env.DB_PASSWORD),
    server: String(process.env.DB_SERVER),
    database: String(process.env.DB_NAME),
    options: {
      encrypt: true, 
      enableArithAbort: true,  
      trustServerCertificate: true 
    }
  };
  
  module.exports = config;
  