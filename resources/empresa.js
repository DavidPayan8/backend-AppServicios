// resources/configEmpresaResource.js
const configEmpresaResource = (config) => {
    return {
        es_tipo_obra: config.es_tipo_obra,
        email_entrante: config.email_entrante || "",
        smtp_user: config.smtp_user,
        color_principal: config.color_principal || "#0d5c91",
        telefono: config.empresa?.telefono || null,
        isLaTorre: config.isLaTorre || false,
    };
};

module.exports = { configEmpresaResource };