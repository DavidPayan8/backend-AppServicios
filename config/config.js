require('dotenv').config();


module.exports = {
    development: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_SERVER,
        dialect: 'mssql',
        dialectOptions: {
            options: {
                encrypt: false,
                enableArithAbort: true,
                trustServerCertificate: true
            }
        },
        timezone: '+00:00',
        logging: false
    }
};
