const { PushBrowser } = require("../Model");
const webpush = require("../config/push");
const { Op } = require("sequelize");

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
      // Si ya existe, nos aseguramos de que esté activa y asignada al usuario actual
      await browser.update({
        p256dh: keys.p256dh,
        auth: keys.auth,
        isActive: true,
        id_usuario: id_usuario || browser.id_usuario,
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

/**
 * Reasigna una suscripción existente al usuario actual (Login)
 */
exports.reassign = async (req, res) => {
  try {
    const { endpoint } = req.body;
    const id_usuario = req.user?.id;

    if (!endpoint || !id_usuario) {
      return res.status(400).json({ message: "Faltan datos (endpoint/user)" });
    }

    const browser = await PushBrowser.findOne({ where: { endpoint } });

    if (browser) {
      await browser.update({
        id_usuario,
        isActive: true,
      });
      return res.json({ message: "Suscripción reasignada correctamente" });
    }

    return res.status(404).json({ message: "Suscripción no encontrada" });
  } catch (error) {
    console.error("Error reassigning push:", error);
    return res.status(500).json({ message: "Error interno" });
  }
};

/**
 * Desactiva las suscripciones del usuario (Logout)
 */
exports.deactivate = async (req, res) => {
  try {
    const id_usuario = req.user?.id;

    if (!id_usuario) {
      return res.status(400).json({ message: "Usuario no identificado" });
    }

    await PushBrowser.update(
      { isActive: false },
      { where: { id_usuario, isActive: true } },
    );

    return res.json({ message: "Suscripciones desactivadas correctamente" });
  } catch (error) {
    console.error("Error deactivating push:", error);
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
 * @param {Object} options Opciones adicionales { icon, badge, vibrate }
 */
exports.sendPushToUsers = async (
  userIds,
  title,
  body,
  url = "/inicio",
  options = {},
) => {
  try {
    const whereClause = { isActive: true };

    if (userIds) {
      if (Array.isArray(userIds)) {
        whereClause.id_usuario = { [Op.in]: userIds };
      } else {
        whereClause.id_usuario = userIds;
      }
    }

    const browsers = await PushBrowser.findAll({
      where: whereClause,
    });

    if (browsers.length === 0) return;

    const frontendUrl = process.env.FRONTEND_URL || "";

    console.log(
      "frontendUrl",
      `${frontendUrl}/assets/img/LogoKong-cortada.png`,
    );
    console.log(
      "frontendUrl",
      `${frontendUrl}/assets/icons/badgets/badget_icon_negative_x48.png`,
    );

    const payload = JSON.stringify({
      notification: {
        title,
        body,
        icon: options.icon || `${frontendUrl}/assets/img/LogoKong-cortada.png`,
        badge:
          options.badge ||
          `${frontendUrl}/assets/icons/badgets/badget_icon_negative_x48.png`,
        vibrate: options.vibrate || [100, 50, 100],
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
          payload,
        );
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.warn(
            `Suscripción caducada o eliminada (${err.statusCode}). Desactivando endpoint: ${browser.endpoint.substring(0, 50)}...`,
          );
          await browser.update({ isActive: false });
        } else if (err.statusCode === 403) {
          // 403 = las claves VAPID actuales no coinciden con las usadas al suscribirse.
          // La suscripción nunca funcionará con las claves actuales → desactivar.
          console.warn(
            `Suscripción con VAPID incorrecto (403). Desactivando endpoint: ${browser.endpoint.substring(0, 50)}...`,
            `\nCausa: ${err.body || "VAPID credentials mismatch"}`,
          );
          await browser.update({ isActive: false });
        } else {
          console.error(
            "Error real enviando push a endpoint:",
            browser.endpoint,
            err,
          );
        }
      }
    }
  } catch (err) {
    console.error("Error en sendPushToUsers:", err);
  }
};
