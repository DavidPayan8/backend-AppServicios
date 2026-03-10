const { sendPushToUsers } = require("./pushBrowserController");

/**
 * POST /api/vb6/push
 *
 * Envía una notificación WebPush directamente a los navegadores suscritos
 * de los usuarios indicados. NO crea registros en la tabla NOTIFICACIONES.
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
    // Envía el WebPush directamente a los navegadores suscritos
    await sendPushToUsers(destino, asunto, cuerpo, url);

    return res.status(200).json({
      success: true,
      ok: true,
      enviados: destino.length,
    });
  } catch (error) {
    console.error("Error en vb6Controller.enviarPush:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor al enviar el push.",
    });
  }
};
