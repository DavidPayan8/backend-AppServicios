const db = require("../Model");

// Caché en memoria: Map<id_empresa, { permisos: Set, expira: timestamp }>
const cache = new Map();
const TTL_MS = 5 * 60 * 1000; // 5 minutos

const loadPermissions = async (id_empresa) => {
  const ahora = Date.now();
  const cached = cache.get(id_empresa);

  if (cached && ahora < cached.expira) {
    return cached.permisos;
  }

  // Consulta módulos habilitados para la empresa
  const modulosHabilitados = await db.EMPRESAS_MODULOS.findAll({
    where: { id_empresa, habilitado: true },
    include: [
      {
        model: db.MODULOS,
        as: "empresas_modulo_modulo",
        attributes: ["clave_modulo"],
      },
    ],
  });

  // Consulta submódulos habilitados para la empresa
  const submodulosHabilitados = await db.EMPRESAS_SUBMODULOS.findAll({
    where: { id_empresa, habilitado: true },
    include: [
      {
        model: db.SUBMODULOS,
        as: "empresas_submodulo_submodulo",
        attributes: ["clave"],
      },
    ],
  });

  const permisos = new Set();

  modulosHabilitados.forEach((em) => {
    if (em.empresas_modulo_modulo?.clave_modulo) {
      permisos.add(em.empresas_modulo_modulo.clave_modulo);
    }
  });

  submodulosHabilitados.forEach((es) => {
    if (es.empresas_submodulo_submodulo?.clave) {
      permisos.add(es.empresas_submodulo_submodulo.clave);
    }
  });

  cache.set(id_empresa, { permisos, expira: ahora + TTL_MS });

  return permisos;
};

/**
 * Invalida la caché de una empresa concreta.
 * Llamar tras actualizar los módulos de una empresa.
 */
const invalidateCache = (id_empresa) => {
  cache.delete(id_empresa);
};

/**
 * Middleware que comprueba si la empresa del usuario tiene habilitado
 * un módulo (obligatorio) y opcionalmente un submódulo.
 */
const authorizeModule = (moduloClave, submoduloClave) => {
  return async (req, res, next) => {
    try {
      // Superadmin bypassea todo
      if (req.user?.rol === "superadmin") return next();

      const id_empresa = req.user?.empresa;

      if (!id_empresa) {
        return res.status(403).json({ message: "Empresa no identificada" });
      }

      const permisos = await loadPermissions(id_empresa);

      if (!permisos.has(moduloClave)) {
        return res.status(403).json({ message: "Módulo no habilitado" });
      }

      if (submoduloClave && !permisos.has(submoduloClave)) {
        return res.status(403).json({ message: "Submódulo no habilitado" });
      }

      next();
    } catch (error) {
      console.error("Error en authorizeModule:", error);
      res.status(500).json({ message: "Error interno al verificar permisos" });
    }
  };
};

module.exports = { authorizeModule, invalidateCache };