const fs = require('fs');
const Readable = require('stream').Readable;
const Writable = require('stream').Writable;

class Generator extends Readable {
    constructor(options) {
        if(!options) options = {}
        options.objectMode = true
        super(options)
    }

    _read() {
        this.push({yolo: 'bla'})
        this.push(null)
    }
}

class Printer extends Writable {
    constructor(options) {
        if(!options) options = {}
        options.objectMode = true
        super(options)
    }

    _write(object, encoding, callback) {
        console.log(JSON.stringify(object))
    }
}

const gen = new Generator()
const print = new Printer()

gen.pipe(print)
