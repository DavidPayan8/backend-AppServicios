const { Client } = require("basic-ftp");
const FTP_CONFIG = require("../../config/ftpConfig");

class FtpPool {
  constructor(SIZE = 5) {
    this.size = SIZE;
    this.pool = [];
    this.queue = [];
    this.activeClients = new Set();
  }

  // Crear un nuevo cliente FTP
  async createClient() {
    const client = new Client();

    // Asignar un ID único para depuración
    client._id = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    try {
      await client.access(FTP_CONFIG);
      console.log(`[FTP POOL] Cliente creado: ${client._id}`);
      return client;
    } catch (err) {
      console.error(`[FTP POOL] Error al crear cliente: ${err.message}`);
      try {
        client.close();
      } catch (_) {}
      throw err;
    }
  }

  // Verificar si el cliente está activo
  async isClientAlive(client) {
    try {
      await client.cd("/"); // Comando inocuo
      return true;
    } catch {
      return false;
    }
  }

  // Obtener un cliente del pool
  async getClient() {
    console.log("<<<<<< Pool getClient", this.pool.length, this.queue.length, this.activeClients.size);

    // Filtrar conexiones no válidas
    const aliveClients = [];
    for (const c of this.pool) {
      if (await this.isClientAlive(c)) {
        aliveClients.push(c);
      } else {
        try {
          c.close();
        } catch (_) {}
      }
    }
    this.pool = aliveClients;

    // Tomar el primero disponible (FIFO)
    if (this.pool.length > 0) {
      const client = this.pool.shift();
      this.activeClients.add(client);
      console.log(`[FTP POOL] Cliente entregado: ${client._id}`);
      return client;
    }

    const totalConnections = this.pool.length + this.activeClients.size + this.queue.length;
    if (totalConnections < this.size) {
      const client = await this.createClient();
      this.activeClients.add(client);
      return client;
    }

    // Esperar a que se libere uno
    return new Promise((resolve, reject) => {
      this.queue.push({
        resolve: (client) => {
          this.activeClients.add(client);
          console.log(`[FTP POOL] Cliente entregado desde queue: ${client._id}`);
          resolve(client);
        },
        reject,
      });
    });
  }

  // Liberar un cliente de vuelta al pool
  releaseClient(client) {
    if (!client) return;

    console.log(`[FTP POOL] Liberando cliente: ${client._id}`);
    this.activeClients.delete(client);

    this.isClientAlive(client).then((alive) => {
      if (!alive) {
        try {
          client.close();
        } catch (_) {}
        return;
      }

      if (this.queue.length > 0) {
        const { resolve } = this.queue.shift();
        resolve(client);
      } else if (this.pool.length < this.size) {
        this.pool.push(client);
      } else {
        try {
          client.close();
        } catch (_) {}
      }
    });
  }

  // Cerrar todos los clientes activos y del pool
  closeAll() {
    this.pool.forEach(client => {
      try {
        client.close();
      } catch (_) {}
    });
    this.pool = [];

    this.activeClients.forEach(client => {
      try {
        client.close();
      } catch (_) {}
    });
    this.activeClients.clear();
    console.log("[FTP POOL] Todos los clientes cerrados");
  }
}

module.exports = new FtpPool();
