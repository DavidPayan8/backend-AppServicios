
const ftp = {
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    secure: process.env.FTP_SECURE === "true",
    secureOptions: { rejectUnauthorized: false },
    BASE_PATH: process.env.BASE_PATH,
  };
  
  module.exports = ftp;
  