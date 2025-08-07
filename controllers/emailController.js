const db = require("../Model");
const { sendEmail } = require("../utils/sendMail");

const enviarEmails = async (req, res) => {
  const { cliente, email, pdf, htmlContent } = req.body;
  const { empresa } = req.user;

  try {
    const config = await db.CONFIG_EMPRESA.findOne({
      where: { id_empresa: empresa },
      attributes: ["smtp_host", "smtp_port", "smtp_user", "smtp_pass"],
    });

    if (!config) {
      return res.status(400).json({
        message: "Su empresa no tiene configurada la salida de correos",
      });
    }

    const from = config.smtp_user;
    const admin = config.smtp_user;
    const subject = `Albarán firmado - ${cliente ?? "Cliente desconocido"}`;

    const attachments = [{
      filename: "albaranFirmado.pdf",
      content: Buffer.from(pdf, "base64"),
    }];

    // Enviar a cliente
    await sendEmail(config, {
      from,
      to: email,
      subject,
      html: htmlContent || "<p>Adjunto albarán firmado</p>",
      attachments,
    });

    // Enviar a administración
    await sendEmail(config, {
      from,
      to: admin,
      subject,
      html: htmlContent || '<p>Adjunto albarán firmado</p>',
      attachments,
    });

    res.status(200).json({ message: "Email enviado correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error enviando mail", error: error.message });
  }
};

/**
 * Envía un correo con la solicitud y archivos
 * @param {Object} params
 * @param {Object} params.solicitud - Instancia de SOLICITUD creada
 * @param {number} params.empresaId - ID de empresa
 * @param {Array} params.archivos - Archivos adjuntos
 */
const enviarSolicitud = async ({ solicitud_id, empresaId, archivos }) => {
  /*   // Preparar HTML
    const html = `
        <p id="solicitud_id">${solicitud.id}</p>
        <p id="fecha_solicitud"> ${solicitud.fecha_solicitud}</p>
        <p id="cliente_id">
        <p id="peticionario_id"> ${solicitud.peticionario_id}<</p>
        <p id="notas">${solicitud.nota}</p>
    `; */


  const configRaw = await db.CONFIG_EMPRESA.findOne({
    where: { id_empresa: empresaId },
    attributes: ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass'],
  });

  if (!configRaw) {
    throw new Error('La empresa no tiene configuración de correo');
  }

  const config = configRaw.get({ plain: true });

  const info = await sendEmail(
    config,
    {
      from: config.smtp_user,
      to: 'davidpayanalvarado@gmail.com',
      subject: `Solicitud Presupuesto #${solicitud_id}`,
      html: '',
      attachments: archivos.map((archivo) => ({
        filename: archivo.filename,
        content: archivo.buffer,
        contentType: archivo.mimetype || 'application/octet-stream',
      }))
    }
  );
  return info
};


module.exports = {
  enviarEmails,
  enviarSolicitud
};
