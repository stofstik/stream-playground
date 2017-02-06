const { Readable }  = require('stream');

const LONG_STRING = 'bla';

class Overflower extends Readable {
  constructor(options = {}) {
    options.objectMode = false;
    options.highWaterMark = 4;
    super(options);
    setInterval(() => {
      const object = {
        time: new Date(),
        random: this.randomData(),
        bufferLength: this._readableState.buffer.length
      };
      const json = JSON.stringify(object);
      console.log('pushing', json);
      this.push(json);
    }, 100);
  }

  randomData() {
    return Math.random(0, 10);
  }

  // gets called on every push
  _read() {
    console.log(new Date(), this._readableState.buffer.length);
  }
}

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

class Sensible extends Readable {
  constructor(options = {}) {
    options.highWaterMark = 16;
    super(options);
    this._busy = false;
  }

  _read() {
    if (this._busy) {
      return;
    }
    this._busy = true;
    this.retrieveMoreData();
  }

  retrieveMoreData() {
    this.doSomeWork((error, newData) => {
      if (error) {
        this.emit('error', error);
      }
      const pushMore = this.push(newData);
      if (pushMore) {
        this.retrieveMoreData();
      } else {
        this._busy = false;
      }
    });
  }

  doSomeWork() {

  }
}


module.exports = { Overflower, Generator, Sensible };
