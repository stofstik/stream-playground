const { Writable }  = require('stream');
const { Lolzify, Stringify } = require('./transformers');

const ws = Writable();
ws._write = function (chunk, enc, next) {
  console.log(chunk);
  next();
}

process.stdin.pipe(ws)
