/**
 * Transforma un modelo CLIENTE para exponer sus relaciones correctamente
 * @param {object} cliente - Instancia Sequelize del modelo CLIENTE
 * @returns {object} Cliente plano con la relación `peticionarios`
 */
function clienteResource(cliente) {
    const plain = cliente.get({ plain: true });

    return {
        ...plain,
        peticionarios: plain.cliente_peticionarios ?? [],
        cliente_peticionarios: undefined
    };
}

/**
 * Aplica `clienteResource` a una lista de clientes
 * @param {object[]} clientes - Array de instancias Sequelize de CLIENTE
 * @returns {object[]} Clientes transformados
 */
function clienteCollection(clientes) {
    return clientes.map(clienteResource);
}

module.exports = {
    clienteResource,
    clienteCollection,
};