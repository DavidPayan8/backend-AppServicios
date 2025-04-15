const nodemailer = require("nodemailer");
const { obtenerDatosTransportador } = require("../models/emailModel");


const ADMIN_EMAIL = "pruebasinternas@kongconsulting.es";

// secure = true para 465, false para otros puertos
// TLS reemplaza a SSL (deprecated)
// const transporter = nodemailer.createTransport({
//   host: "cp7073.webempresa.eu", // Servidor SMTP
//   port: 465, // Puerto para  SSL
//   secure: true, // Utilizar SSL
//   auth: {
//     user: ADMIN_EMAIL, // Correo
//     pass: "Pruebas2025.", // Contraseña del correo
//   },
// });

// Configurar Nodemailer
/* const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: ADMIN_EMAIL,
    pass: "ofhx zqmi xhos fdpu",
  },
}); */

/* const transporter = nodemailer.createTransport({
  host: "smtp.thrspain.com",
  port: 25,
  secure: false, // true para 465, false para otros puertos
  requireTLS: true, // TLS reemplaza a SSL (deprecated)
  auth: {
      user: "administracion@thrspain.com",
      pass: "Administracion2021!",
  },
  tls: {
      rejectUnauthorized: false,
  },
});  */

/**
 * Función común para enviar correos electrónicos
 * @param {import("nodemailer").Transporter} transporter - Transportador con el cual enviar el correo
 * @param {string} from - Dirección de correo del remitente
 * @param {string} to - Dirección de correo del destinatario
 * @param {string} subject - Asunto del correo
 * @param {string} text - Cuerpo del correo
 * @param {Buffer} pdfBuffer - El archivo PDF en formato Buffer
 */
const enviarEmail = async (transporter, from, to, subject, text, pdfBuffer) => {
  const mailOptions = {
    from: from,
    to: to,
    subject: subject,
    text: text,
    attachments: [
      {
        filename: "albaranFirmado.pdf",
        content: pdfBuffer,
      },
    ],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Correo enviado:", info); // Para depuración
    return info;
  } catch (error) {
    console.error("Error enviando correo:", error);
    throw new Error("Error enviando el correo");
  }
};

/**
 * Función para enviar el correo al cliente y luego al admin
 */
const enviarEmails = async (req, res) => {
  const { cliente, email, pdf } = req.body;

  try {
    // Obtener datos de transporte para la empresa
    const data = await obtenerDatosTransportador(req.user.id);

    // Empresa no tiene email
    if (data == null) {
      res.status(400).send({ message: "Su empresa no tiene configurada la salida de correos" });
      return;
    }

    const transporter = getTransporter(data);

    const from = data.smtp_user;
    const administracion = data.smtp_user;


    // Convertir el PDF de base64 a Buffer
    const pdfBuffer = Buffer.from(pdf, "base64");

    // Enviar email al cliente
    await enviarEmail(
      transporter,
      from,
      email,
      "Albarán Firmado PDF - " + cliente,
      "Adjunto una copia del albarán firmado.",
      pdfBuffer
    );

    // Enviar email a la administración
    await enviarEmail(
      transporter,
      from,
      administracion,
      "Albarán Firmado PDF - " + cliente,
      "Adjunto una copia del albarán firmado.",
      pdfBuffer
    );

    res.status(200).send({ message: "Mail enviado correctamente a cliente y admin" });
  } catch (error) {
    res.status(500).send({ message: "Error enviando mail", error: error.message });
  }
};

const getTransporter = (data) => {
  const options = {
    host: data.smtp_host,
    port: data.smtp_port,
    auth: {
      user: data.smtp_user,
      pass: data.smtp_pass,
    },
  };

  if (options.port == 465) {
    // Utilizar SSL (deprecated)
    options.secure = true;
    options.requireTLS = false;
  } else {
    // Utilizar TLS
    options.secure = false;
    options.requireTLS = true;
    options.tls = {
      requireTLS: false,
      rejectUnauthorized: false,
    };
  }

  return nodemailer.createTransport(options);
}

module.exports = {
  enviarEmails,
};
