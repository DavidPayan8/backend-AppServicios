const { Client } = require("basic-ftp");
const FTP_CONFIG = require("../../config/ftpConfig");

class FtpPool {
  constructor(SIZE = 5) {
    this.size = SIZE;
    this.pool = [];
    this.queue = [];
    this.activeClients = new Set();
  }

  async createClient() {
    const client = new Client();
    await client.access(FTP_CONFIG);
    return client;
  }

  async getClient() {
    console.log("<<<<<< Pool getClient");

    // Limpiar conexiones cerradas del pool
    this.pool = this.pool.filter(client => !client.closed);

    while (this.pool.length > 0) {
      const client = this.pool.pop();
      if (!client.closed) {
        this.activeClients.add(client);
        return client;
      }
    }

    const totalConnections = this.pool.length + this.activeClients.size + this.queue.length;
    if (totalConnections < this.size) {
      const client = await this.createClient();
      this.activeClients.add(client);
      return client;
    }

    // Esperar a que haya una conexión disponible
    return new Promise((resolve, reject) => {
      this.queue.push({
        resolve: (client) => {
          this.activeClients.add(client);
          resolve(client);
        },
        reject,
      });
    });
  }

  releaseClient(client) {
    console.log("<<<<<< Pool releaseClient");

    this.activeClients.delete(client);

    if (!client || client.closed) {
      try {
        client?.close();
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
  }

  closeAll() {
    this.pool.forEach(client => {
      try { client.close(); } catch (_) {}
    });
    this.pool = [];
    this.activeClients.forEach(client => {
      try { client.close(); } catch (_) {}
    });
    this.activeClients.clear();
  }
}

module.exports = new FtpPool();
