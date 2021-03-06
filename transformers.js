const { Transform, Duplex } = require('stream');

/*
 * Lolzify object if data > 0.5
 */
class Lolzify extends Transform {
  constructor(options = {}) {
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

class MyDuplex extends Duplex {
  constructor(name = '', options = {}) {
    options.objectMode    = true;
    options.highWaterMark = 4;
    super(options);
    this.name    = name;
    this.getMore = [];
  }

  _write(object, enc, cb) {
    const pushMore = this.push(object);
    if (pushMore) {
      cb();
    } else {
      this.getMore.push(cb);
    }
  }

  _read() {
    while (this.getMore.length) {
      this.getMore.shift()();
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
 * This works, but lets use some es6 object destructuring : )
 */
// module.exports.Lolzify   = Lolzify;
// module.exports.Stringify = Stringify;

module.exports = { Lolzify, Stringify, MyDuplex };
