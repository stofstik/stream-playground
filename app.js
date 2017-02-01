const Readable  = require('stream').Readable;
const Writable  = require('stream').Writable;
const Transform = require('stream').Transform;
const net       = require('net');
const ioClient  = require('socket.io-client');

const SERVICE_REGISTRY_URL = 'http://localhost:3001';
const SERVICE_NAME = 'person-stream';

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
    setTimeout(() => {
      this.push(this.randomData());
    }, 1000);
  }
}

/*
 * Add lolz
 */
class Lolzify extends Transform {
  constructor(source, options = {}) {
    options.readableObjectMode = true;
    options.writableObjectMode = true;
    super(options);
  }

  _transform(object, encoding, callback) {
    if (object.data > 0.5) {
      callback(null, Object.assign({}, object, { lolz: true }));
    } else {
      callback(null, object);
    }
  }
}

/*
 * Transform stream to stringify objects and convert them to buffers
 */
class Stringify extends Transform {
  constructor(source, options = {}) {
    options.readableObjectMode = true;
    options.writableObjectMode = true;
    super(options);
  }

  _transform(object, encoding, callback) {
    if (object.data > 0.5) {
      const string = JSON.stringify(Object.assign({}, object, { lolz: true }));
      const buffer = Buffer.from(string, 'utf-8');
      callback(null, buffer);
    } else {
      const string = JSON.stringify(object);
      const buffer = Buffer.from(string, 'utf-8');
      callback(null, buffer);
    }
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
const gen       = new Generator();
const lolzify   = new Lolzify();
const stringify = new Stringify();
const print     = new Printer();

/*
 * Set up streams
 */
gen.pipe(lolzify).pipe(stringify).pipe(print);
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
