const db = require("../Model");
const { create } = require('xmlbuilder2');
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
const enviarSolicitud = async ({ solicitud_id, empresaId, archivos, user, accion }) => {

  const configRaw = await db.CONFIG_EMPRESA.findOne({
    where: { id_empresa: empresaId },
    attributes: ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass'],
  });

  if (!configRaw) {
    throw new Error('La empresa no tiene configuración de correo');
  }

  const config = configRaw.get({ plain: true });

  const xmlData = await createXml('Solicitud', solicitud_id, accion, user);

  const info = await sendEmail(
    config,
    {
      from: config.smtp_user,
      to: 'davidpayanalvarado@gmail.com',
      subject: `Solicitud`,
      text: xmlData,
      attachments: archivos.map((archivo) => ({
        filename: archivo.filename,
        content: archivo.buffer,
        contentType: archivo.mimetype || 'application/octet-stream',
      }))
    }
  );
  return info
};


/**
 * Envía un correo con los adjuntos de la OT
 * @param {Object} params
 * @param {number} params.ot_id - ID de orden trabajo creada
 * @param {number} params.empresaId - ID de empresa
 * @param {Array} params.archivos - Archivos adjuntos
 */
const enviarAdjuntosOt = async ({ identify, empresa, archivos, accion, user }) => {

  console.log('Enviando adjuntos OT:', identify, empresa, accion);

  const configRaw = await db.CONFIG_EMPRESA.findOne({
    where: { id_empresa: empresa },
    attributes: ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass'],
  });

  if (!configRaw) {
    throw new Error('La empresa no tiene configuración de correo');
  }

  const config = configRaw.get({ plain: true });

  const xmlData = await createXml('OT', identify, accion, user);

  const attachments = accion === 'delete' ? [] : archivos?.map((archivo) => ({
    filename: archivo.filename,
    content: archivo.buffer,
    contentType: archivo.mimetype || 'application/octet-stream',
  }));

  const info = await sendEmail(
    config,
    {
      from: config.smtp_user,
      to: 'davidpayanalvarado@gmail.com',
      subject: `OT`,
      text: xmlData,
      attachments
    }
  );
  return info
};

async function createXml(tipo, id, accion, user) {
  const syncData = {
    SyncRequest: {
      '@schema': 'kong.sync.v1',
      '@entity': tipo,
      '@action': accion,
      '@user': user,
      '@env': 'prod',
      '@timestamp': new Date().toISOString(),
      Id: id
    }
  };

  return await create({ version: '1.0', encoding: 'UTF-8' })
    .ele(syncData)
    .end({ prettyPrint: true });
}


module.exports = {
  enviarEmails,
  enviarSolicitud,
  enviarAdjuntosOt
};
