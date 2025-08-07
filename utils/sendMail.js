const nodemailer = require("nodemailer");

/**
 * Crea un transporter de Nodemailer a partir de la configuración SMTP
 * @param {object} config - Configuración SMTP de la empresa
 * @returns {import("nodemailer").Transporter}
 */
const getTransporter = (config) => {
    const options = {
        host: config.smtp_host,
        port: config.smtp_port,
        auth: {
            user: config.smtp_user,
            pass: config.smtp_pass,
        },
    };

    if (options.port == 465) {
        options.secure = true;
        options.requireTLS = false;
    } else {
        options.secure = false;
        options.requireTLS = true;
        options.tls = {
            rejectUnauthorized: false,
        };
    }

    return nodemailer.createTransport(options);
};

/**
 * Envía un correo electrónico con soporte para HTML, texto plano y adjuntos
 * @param {object} config - Configuración SMTP (host, port, user, pass)
 * @param {object} mailOptions - Opciones del correo
 * @param {string} mailOptions.from - Dirección del remitente
 * @param {string|string[]} mailOptions.to - Destinatario(s)
 * @param {string} mailOptions.subject - Asunto
 * @param {string} [mailOptions.text] - Texto plano
 * @param {string} [mailOptions.html] - Cuerpo en HTML
 * @param {Array<{filename: string, content: Buffer|string, contentType?: string}>} [mailOptions.attachments] - Archivos adjuntos
 */
const sendEmail = async (config, mailOptions) => {
    const transporter = getTransporter(config);

    try {
        return await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error("Error enviando correo:", err);
        throw err;
    }
};

module.exports = {
    sendEmail,
};
