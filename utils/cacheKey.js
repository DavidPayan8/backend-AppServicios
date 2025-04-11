function getCacheKey(id_usuario, id_empresa, tipo) {
    const dbname = process.env.DB_NAME;
    return `ftp:listado:${dbname}:${id_empresa}:${id_usuario}:${tipo}`;
  }
  
  module.exports = {
    getCacheKey,
  };