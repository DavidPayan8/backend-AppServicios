const { sendPushToUsers } = require("./pushBrowserController");
const db = require("../Model");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

/**
 * POST /api/vb6/push
 *
 * Envía una notificación WebPush directamente a los navegadores suscritos
 * de los usuarios indicados. NO crea registros en la tabla NOTIFICACIONES.
 *
 * Devuelve además la lista de suscripciones activas encontradas para
 * que el bridge pueda logearlas y el desarrollador las revise en BD.
 *
 * Body:
 *   destino   {number[]}  IDs de usuario destinatarios
 *   asunto    {string}    Título de la notificación push
 *   cuerpo    {string}    Cuerpo del mensaje
 *   url       {string}    (opcional) URL al hacer clic (defecto: /inicio)
 */
exports.enviarPush = async (req, res) => {
  const { destino, asunto, cuerpo, url = "/inicio" } = req.body;

  // Validaciones básicas
  if (!Array.isArray(destino) || destino.length === 0) {
    return res.status(400).json({
      success: false,
      message: "'destino' debe ser un array de IDs de usuario no vacío.",
    });
  }

  if (destino.some((d) => typeof d !== "number")) {
    return res.status(400).json({
      success: false,
      message: "Todos los elementos de 'destino' deben ser números.",
    });
  }

  if (!asunto || !cuerpo) {
    return res.status(400).json({
      success: false,
      message: "'asunto' y 'cuerpo' son obligatorios.",
    });
  }

  try {
    // 1. Consultar qué navegadores (PushBrowser) están suscritos y activos
    const suscripciones = await db.PushBrowser.findAll({
      where: {
        id_usuario: { [Op.in]: destino },
        isActive: true,
      },
      attributes: ["id", "id_usuario", "endpoint"],
    });

    // Preparar info de log: id BD, usuario y primeros/últimos chars del endpoint
    const infoSuscripciones = suscripciones.map((s) => ({
      id_push_browser: s.id,
      id_usuario: s.id_usuario,
      endpoint_preview: `${s.endpoint.substring(0, 40)}...${s.endpoint.slice(-20)}`,
    }));

    console.log(
      `[VB6 Push] usuarios=${destino} | suscripciones activas=${suscripciones.length} | asunto="${asunto}"`,
    );

    // 2. Enviar el WebPush
    await sendPushToUsers(destino, asunto, cuerpo, url);

    return res.status(200).json({
      success: true,
      ok: true,
      enviados: suscripciones.length,
      suscripciones: infoSuscripciones, // ← para el log del bridge
    });
  } catch (error) {
    console.error("Error en vb6Controller.enviarPush:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor al enviar el push.",
    });
  }
};

/**
 * POST /api/vb6/hash-password
 *
 * Recibe una contraseña en texto plano y devuelve su hash bcrypt.
 * Permite a la aplicación VB6 generar hashes compatibles con el sistema
 * sin tener que implementar bcrypt localmente.
 *
 * Body:
 *   password  {string}  Contraseña en texto plano a hashear
 */
exports.hashPassword = async (req, res) => {
  const { password } = req.body;

  if (!password || typeof password !== "string") {
    return res.status(400).json({
      success: false,
      message: "'password' es obligatorio y debe ser un string.",
    });
  }

  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    return res.status(200).json({
      success: true,
      hash,
    });
  } catch (error) {
    console.error("Error en vb6Controller.hashPassword:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor al hashear la contraseña.",
    });
  }
};
