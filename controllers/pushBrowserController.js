const { PushBrowser } = require("../Model");
const webpush = require("../config/push");

exports.subscribe = async (req, res) => {
  try {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ message: "Suscripción inválida" });
    }

    const id_usuario = req.user?.id || null;

    const [browser, created] = await PushBrowser.findOrCreate({
      where: { endpoint },
      defaults: {
        p256dh: keys.p256dh,
        auth: keys.auth,
        isActive: true,
        id_usuario,
      },
    });

    if (!created) {
      await browser.update({
        p256dh: keys.p256dh,
        auth: keys.auth,
        isActive: true,
        id_usuario: id_usuario ?? browser.id_usuario,
      });
    }

    return res.status(201).json({
      message: created ? "Suscripción creada" : "Suscripción actualizada",
    });
  } catch (error) {
    console.error("Error subscribe push:", error);
    return res.status(500).json({ message: "Error interno" });
  }
};

exports.sendPush = async (req, res) => {
  try {
    const { title, body } = req.body;
    await exports.sendPushToUsers(null, title, body);
    res.json({ message: "Push enviados" });
  } catch (err) {
    console.error("Error en sendPush:", err);
    res.status(500).json({ message: "Error interno" });
  }
};

/**
 * Envía notificaciones Push a una lista de usuarios (o a todos si userIds es null)
 * @param {Array|number|null} userIds ID o array de IDs de usuario
 * @param {string} title Título de la notificación
 * @param {string} body Cuerpo del mensaje
 * @param {string} url URL opcional al clicar
 */
exports.sendPushToUsers = async (userIds, title, body, url = "/inicio") => {
  try {
    const whereClause = { isActive: true };

    if (userIds) {
      whereClause.id_usuario = Array.isArray(userIds) ? userIds : [userIds];
    }

    const browsers = await PushBrowser.findAll({
      where: whereClause,
    });

    if (browsers.length === 0) return;

    const payload = JSON.stringify({
      notification: {
        title,
        body,
        icon: "assets/img/LogoKong-cortada.png",
        vibrate: [100, 50, 100],
        data: { url },
      },
    });

    for (const browser of browsers) {
      try {
        await webpush.sendNotification(
          {
            endpoint: browser.endpoint,
            keys: {
              p256dh: browser.p256dh,
              auth: browser.auth,
            },
          },
          payload
        );
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.warn(
            `Suscripción caducada o eliminada (410/404). Desactivando endpoint: ${browser.endpoint.substring(0, 50)}...`
          );
          await browser.update({ isActive: false });
        } else {
          console.error(
            "Error real enviando push a endpoint:",
            browser.endpoint,
            err
          );
        }
      }
    }
  } catch (err) {
    console.error("Error en sendPushToUsers:", err);
  }
};
