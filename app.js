const net          = require('net');
const { Client }   = require('./service-registry');
const { Sensible } = require('./readables');

const SERVICE_NAME = 'person-stream';

/*
 * Initiate streams
 */
const sensible = new Sensible();

/*
 * Initiate Net server
 */
const server = net.createServer((socket) => {
  console.log('socket connected:', socket.address().port);
  // Set some event listeners for this connection
  socket.on('close', () => {
    console.log('socket disconnected:');
  });
  socket.on('error', (error) => {
    console.log('socket error:', error);
  });
  // Pipe generator data to this newly connected socket
  sensible.pipe(socket);
});
// Set error listener for server
server.on('error', (err) => {
  throw err;
});

/*
 * Start server on a random port
 */
server.listen(() => {
  console.log('opened server on', server.address());
  // App started, connect to the service registry
  new Client(server, SERVICE_NAME).connect();
});
