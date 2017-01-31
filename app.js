const fs = require('fs');
const Readable = require('stream').Readable;
const Writable = require('stream').Writable;

class Generator extends Readable {
    constructor(options) {
        if(!options) options = {}
        options.objectMode = true
        super(options)
    }

    randomData() {
        return {data: Math.random(0, 10)}
    }

    _read() {
        setTimeout(() => {
            this.push(this.randomData())
        }, 1000)
    }
}

class Printer extends Writable {
    constructor(options) {
        if(!options) options = {}
        options.objectMode = true
        super(options)
    }

    _write(object, encoding, callback) {
        console.log('writing', JSON.stringify(object))
        callback()
    }
}

const gen = new Generator()
const print = new Printer()

gen.on('data', (data) => {
    console.log('data generated', data)
})

gen.pipe(print)
