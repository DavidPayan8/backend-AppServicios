const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: Number(process.env.FTP_CACHE_TTL) });
console.log(">>>> Cache")


module.exports = cache;
