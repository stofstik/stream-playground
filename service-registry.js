const ioClient = require('socket.io-client');

const URL = 'http://localhost:3001';

class Client {
  constructor(server, serviceName) {
    this.server      = server;
    this.serviceName = serviceName;
  }

  /*
   * Connect to service registry
   */
  connect() {
    // Create new connection
    const connection = ioClient.connect(URL, { reconnection: true });

    // Connected!
    connection.on('connect', () => {
      console.log('service registry connected');
      // Tell the registry we are a service
      connection.emit('service-up',
        { name: this.serviceName,
          port: this.server.address().port
        });
    });

    // Disconnected
    connection.on('disconnect', () => {
      console.log('service registry disconnected');
    });

    return connection;
  }
}

module.exports = { Client };
