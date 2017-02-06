const { Readable }  = require('stream');
const { Writable }  = require('stream');
const fs           = require('fs');
const net           = require('net');
const ioClient      = require('socket.io-client');

const { Overflower, Generator, Sensible } = require('./readables');
const { Lolzify, Stringify } = require('./transformers');

const SERVICE_REGISTRY_URL = 'http://localhost:3001';
const SERVICE_NAME         = 'person-stream';

/*
 * Holds our connected sockets
 */
let sockets = [];

/*
 * Prints out chunks to console in utf-8
 */
class Printer extends Writable {
  constructor(options = {}) {
    options.objectMode = true;
    super(options);
  }

  _write(chunk, encoding, callback) {
    console.log(chunk.toString('utf-8'));
    callback();
  }
}

/*
 * Initiate streams
 */
const overflower    = new Overflower();
const gen           = new Generator();
const lolzify       = new Lolzify();
const stringify     = new Stringify();
const sensible      = new Sensible();
const print         = new Printer();

const stdout = process.stdout;

overflower.on('data', (chunk) => {
  stdout.write('received ' + chunk.toString() + '\n');
  overflower.pause();
  setTimeout(() => {
    overflower.resume();
  }, 2000);
});

// overflower.pipe(stdout);

/*
 * Set up streams
 */
stringify.on('data', (data) => {
  sockets.map((s) => {
    s.write(data);
  });
});

/*
 * Initiate Net server
 */
const server = net.createServer((socket) => {
  socket.on('close', () => {
    sockets.splice(sockets.indexOf(socket), 1);
    console.log('socket disconnected:', sockets.length);
  });
});
server.on('error', (err) => {
  throw err;
});
server.on('connection', (socket) => {
  sockets.push(socket);
  console.log('socket connected:', sockets.length);
});
server.listen(() => {
  console.log('opened server on', server.address());
});

/*
 * Service registry logic
 */
const serviceRegistry =
  ioClient.connect(SERVICE_REGISTRY_URL, { reconnection: true });
serviceRegistry.on('connect', () => {
  console.log('service registry connected');
  // Tell the registry we are a service
  serviceRegistry.emit('service-up',
    { name: SERVICE_NAME, port: server.address().port });
});
serviceRegistry.on('disconnect', () => {
  console.log('service registry disconnected');
});
