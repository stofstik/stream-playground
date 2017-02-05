const { Transform } = require('stream');

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

module.exports = { Lolzify, Stringify }
