const nodemailer = require("nodemailer");

const ADMIN_EMAIL = "davidpayanalvarado@gmail.com";

// Configurar Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: ADMIN_EMAIL,
    pass: "ofhx zqmi xhos fdpu",
  },
});


/* const transporter = nodemailer.createTransport({
  host: "cp7073.webempresa.eu", // Servidor SMTP
  port: 465, // Puerto para  SSL
  secure: true, // Utilizar SSL
  auth: {
    user: ADMIN_EMAIL, // Correo
    pass: "Pruebas2025.", // Contraseña del correo
  },
}); */

/**
 * Función común para enviar correos electrónicos
 * @param {string} to - Dirección de correo del destinatario
 * @param {string} subject - Asunto del correo
 * @param {string} text - Cuerpo del correo
 * @param {Buffer} pdfBuffer - El archivo PDF en formato Buffer
 */
const enviarEmail = async (to, subject, text, pdfBuffer) => {
  const mailOptions = {
    from: `Kong Consulting <${ADMIN_EMAIL}>`,
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
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error enviando correo:", error);
    throw new Error("Error enviando el correo");
  }
};

/**
 * Función para enviar el correo al cliente y luego al admin
 */
const enviarEmails = async (req, res) => {
  const { email, pdf } = req.body;
  try {
    // Convertir el PDF de base64 a Buffer
    const pdfBuffer = Buffer.from(pdf, "base64");

    // Enviar email al cliente
    await enviarEmail(
      email,
      "Albarán Firmado PDF",
      "Adjunto una copia del albarán firmado.",
      pdfBuffer
    );

    // Enviar email a la administración
    await enviarEmail(
      ADMIN_EMAIL,
      "Albarán Firmado PDF - Admin",
      "Adjunto una copia del albarán firmado.",
      pdfBuffer
    );

    res.status(200).send({ message: "Mail enviado correctamente a cliente y admin" });
  } catch (error) {
    res.status(500).send({ message: "Error enviando mail", error: error.message });
  }
};

module.exports = {
  enviarEmails,
};
