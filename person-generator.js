const EventEmitter = require('EventEmitter');
const _            = require('underscore');
const Chance       = require('chance');

class Generator extends EventEmitter {
  constructor() {
    super();
    this.types    = [ 'first', 'last', 'gender', 'birthday', 'age', 'ssn' ];
    this.chance   = new Chance();
    this.interval = null;
  }

  start() {
    this.stop();
    this.interval = setInterval(() => {
      this.emit('data', this.data());
    }, 1000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  data() {
    return _.chain(this.types)
      .map((t) => {
        if (this.chance[t]) {
          return [ t, this.chance[t]() ];
        }
      })
      .object()
      .value();
  }
}

module.exports = Generator;
