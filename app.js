const { Readable }  = require('stream');
const { Writable }  = require('stream');
const net           = require('net');
const ioClient      = require('socket.io-client');

const { Lolzify, Stringify } = require('./transformers');

const SERVICE_REGISTRY_URL = 'http://localhost:3001';
const SERVICE_NAME         = 'person-stream';

const LONG_TEXT = 'Dolor placeat cum cumque fugit corrupti? Beatae id consectetur cum voluptatum esse esse ab, amet? Asperiores suscipit vitae illo numquam non in ipsum? Velit officiis dolorum aliquam sit voluptas tempora!';

/*
 * Holds our connected sockets
 */
let sockets = [];

/*
 * Readable stream that emits random data every 1 sec
 * TODO This timeout approach smells, what might be a better way?
 */
class Generator extends Readable {
  constructor(options = {}) {
    options.objectMode = true;
    super(options);
  }

  randomData() {
    return { data: Math.random(0, 10) };
  }

  _read() {
    console.log('read');
    this.push(this.randomData());
  }
}

class TextStream extends Readable {
  constructor(options = {}) {
    options.objectMode = false;
    super(options);
  }

  _read() {
    this.push(LONG_TEXT);
    this.push(null);
  }
}

/*
 * Prints out chunks to console in utf-8
 */
class Printer extends Writable {
  constructor(options = {}) {
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
const textStream    = new TextStream();
const gen           = new Generator();
const lolzify       = new Lolzify();
const stringify     = new Stringify();
const print         = new Printer();

/*
 * Set up streams
 */
textStream.on('readable', () => {
  function getStuff() {
    let chunk;
    if ((chunk = textStream.read(16)) !== null) {
      setTimeout(() => {
        console.log(chunk.length);
        stringify.write(chunk);
        print.write(chunk);
        getStuff();
      }, 1000);
    }
  }
  getStuff();
});

const ws = Writable();
ws._write = function (chunk, enc, next) {
  console.log(chunk);
  next();
}

// stringify.on('readable', (data) => {
  // sockets.map((s) => {
    // s.write(data);
  // });
// });

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
  process.stdin.pipe(socket);

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
