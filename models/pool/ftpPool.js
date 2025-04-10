const { Client } = require("basic-ftp");
const FTP_CONFIG = require("../../config/ftpConfig");

class FtpPool {
  constructor(SIZE = 5) {
    this.size = SIZE; // Tamanio maximo
    this.pool = []; // Conexiones disponibles
    this.queue = []; // Cola de solicitudes
  }

  // Crea una nueva conexión FTP
  async createClient() {
    const client = new Client();
    try {
      await client.access(FTP_CONFIG);
      return client;
    } catch (error) {
      console.error("Error al crear la conexión FTP:", error);
      throw error;
    }
  }

  // Devuelve una conexión del pool o crea una nueva si no hay disponibles
  async getClient() {
    console.log("<<<<<< Pool getClient");

    if (this.pool.length > 0) {
      return this.pool.pop();
    }

    if (this.queue.length < this.size) {
      // Si no hay conexiones disponibles y la cola no ha alcanzado el tamaño máximo,
      // creamos una nueva conexión y la agregamos a la cola
      const client = await this.createClient();
      return client;
    }

    // Si no hay conexiones disponibles y la cola está llena, esperamos hasta que una conexión se libere
    return new Promise((resolve, reject) => {
      this.queue.push({ resolve, reject });
    });
  }

  // Devuelve una conexión al pool
  releaseClient(client) {
    console.log("<<<<<< Pool releaseClient");

    // Si el cliente sigue siendo válido, se agrega al pool
    if (client && this.pool.length < this.size) {
      this.pool.push(client);
      
      // Si hay solicitudes esperando en la cola, atendemos la primera
      if (this.queue.length > 0) {
        const { resolve } = this.queue.shift();
        resolve(client); // Resolvemos la promesa con la conexión disponible
      }
    } else {
      client.close();
    }
  }

  // Cierra todas las conexiones activas en el pool
  closeAll() {
    this.pool.forEach((client) => client.close());
    this.pool = [];
  }
}

module.exports = new FtpPool();
