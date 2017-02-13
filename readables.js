const { Readable }  = require('stream');
const Chance        = require('chance');
const _             = require('underscore');

class Overflower extends Readable {
  constructor(options = {}, overflow = false) {
    options.objectMode    = true;
    options.highWaterMark = 4;
    super(options);
    this.overflow = overflow;
  }

  randomData() {
    return Math.random(0, 10);
  }

  // gets called on every push
  _read() {
    console.log(new Date(), this._readableState.buffer.length);
    setInterval(() => {
      const object = {
        time: new Date(),
        random: this.randomData(),
        bufferLength: this._readableState.buffer.length
      };
      const json = JSON.stringify(object);

      // Fill our read buffer
      if (!this.overflow) {
        // Make sure we dont overflow
        if (this.push()) {
          this.push(json);
          console.log('pushing', json);
        }
      } else {
        // Just push, overflow if we dont read fast enough
        this.push(json);
        console.log('pushing', json);
      }
    }, 500);
  }
}

class Sensible extends Readable {
  constructor(options = {}) {
    options.objectMode    = true;
    super(options);
    this._busy  = false;
    this.types  = [ 'first', 'last', 'gender', 'birthday', 'age', 'ssn' ];
    this.chance = new Chance();
  }

  _read() {
    if (this._busy) {
      return;
    }
    this._busy = true;
    this.retrieveMoreData();
  }

  retrieveMoreData() {
    setTimeout(() => {
      this.doSomeWork((error, newData) => {
        if (error) {
          this.emit('error', error);
        }
        // this.push returns true if we are allowed to push into internal buffer
        const pushMore = this.push(newData);
        if (pushMore) {
          // console.log('Pushing', newData);
          this.retrieveMoreData();
        } else {
          console.log('HWM reached stopping generator');
          this._busy = false;
        }
      });
    }, 10);
  }

  doSomeWork(callback) {
    const personData = _.chain(this.types)
      .map((t) => {
        if (this.chance[t]) {
          return [ t, this.chance[t]() ];
        }
      })
      .object()
      .value();
    callback(null, Object.assign({}, { date: new Date() }, personData));
  }
}


module.exports = { Overflower, Sensible };
