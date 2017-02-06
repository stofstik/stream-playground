const { Readable }  = require('stream');
const { Writable }  = require('stream');
const net           = require('net');
const ioClient      = require('socket.io-client');

const { Lolzify, Stringify } = require('./transformers')

const SERVICE_REGISTRY_URL = 'http://localhost:3001';
const SERVICE_NAME         = 'person-stream';

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
    console.log('read!');
    setTimeout(() => {
      this.push(this.randomData());
    }, 1000);
  }
}

class StreamCombine extends Readable {
  constructor(options = {}) {
    super(options);
    this._busy = false
  }

  _read() {
    if(this._busy) return;
    this._busy = true;
    this.retrieveMoreData();
  }

  retrieveMoreData() {
    this.doSomeWork((error, newData) => {
      if(error) this.emit('error', err)
      const pushMore = this.push(newData);
      if(pushMore) {
        this.retrieveMoreData();
      } else {
        this._busy = false;
      }
    });
  }

  doSomeWork() {

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
const gen           = new Generator();
const lolzify       = new Lolzify();
const stringify     = new Stringify();
const streamCombine = new StreamCombine();
const print         = new Printer();

/*
 * Set up streams
 */
streamCombine.pipe(print);
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
