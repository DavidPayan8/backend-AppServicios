const { Sequelize } = require("sequelize");

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    enableArithAbort: true,
    trustServerCertificate: true,
  },
};

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_SERVER,
    dialect: "mssql",
    timezone: '+00:00',
    dialectOptions: {
      options: {
        encrypt: true,
        enableArithAbort: true,
        trustServerCertificate: true,
      },
    },
    logging: false,
  }
);

module.exports = { config, sequelize };
