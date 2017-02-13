const net          = require('net');
const jsonstream   = require('jsonstream2');
const { Client }   = require('./service-registry');
const { Sensible } = require('./readables');

const SERVICE_NAME = 'person-stream';

/*
 * Initiate streams
 */
// Our data generator
const sensible = new Sensible();
// Stringify so we can send over tcp
const stringify = jsonstream.stringify(false);
const stringified = sensible.pipe(stringify);

const sockets = [];

setInterval(() => {
  console.log(new Date());
  console.log('GenR', sensible._readableState.buffer.length);
  console.log('stri', stringify._readableState.buffer.length);
  console.log('stri', stringify._writableState.buffer.length);
  console.log('fied', stringified._readableState.buffer.length);
  console.log('fied', stringified._writableState.buffer.length);

  console.log('Sockets:');
  sockets.map((s) => {
    console.log('R', s._readableState.buffer.length);
    console.log('W', s._writableState.getBuffer().length);
    console.log('B', s.bufferSize);
  });
}, 1000);

/*
 * Initiate Net server
 */
const server = net.createServer((socket) => {
  console.log('socket connected:', socket.address().port);
  // Set some event listeners for this connection
  socket.on('close', () => {
    sockets.splice(sockets.indexOf(socket), 1);
    console.log('socket disconnected:');
  });
  socket.on('error', (error) => {
    console.log('socket error:', error);
  });
  // Pipe generator data to this newly connected socket
  stringified.pipe(socket);
  sockets.push(socket);
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
