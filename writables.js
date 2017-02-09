const { Writable } = require('stream');

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

module.exports = { Printer };
