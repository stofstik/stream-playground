const Readable  = require('stream').Readable
const Writable  = require('stream').Writable
const Transform = require('stream').Transform

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

class Lolzify extends Transform {
    constructor(source, options) {
        if(!options) options = {}
        options.readableObjectMode = true
        options.writableObjectMode = true
        super(options)
    }

    _transform(object, encoding, callback) {
        if(object.data > 0.5) {
            callback(null, Object.assign({}, object, { lolz: true }))
        } else {
            callback(null, object)
        }
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

const gen     = new Generator()
const lolzify = new Lolzify()
const print   = new Printer()

gen.on('data', (data) => {
    console.log('data generated', data)
})

gen.pipe(lolzify).pipe(print)
