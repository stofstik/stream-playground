const { Sensible } = require('./readables');
const { MyDuplex } = require('./transformers');
const JSONStream   = require('jsonstream2');

const gen    = new Sensible();
const first  = new MyDuplex('first');
const second = new MyDuplex('second');
const third  = new MyDuplex('third');

const stringify = JSONStream.stringify(false);
const parse = JSONStream.parse();

gen
  .pipe(first)
  .pipe(second)
  .pipe(stringify)
  .pipe(parse)
  .pipe(third);

third.cork();

const logger = setInterval(() => {
  const genR = gen._readableState.buffer.length;
  const fr = first._readableState.buffer.length;
  const fw = first._writableState.getBuffer().length;
  const sr = second._readableState.buffer.length;
  const sw = second._writableState.getBuffer().length;
  const tr = third._readableState.buffer.length;
  const tw = third._writableState.getBuffer().length;
  console.log(
    ` %s
    gen
      .pipe( r: %s       ${gen._readableState.flowing} )
      .pipe( r: %s, w: %s ${first._readableState.flowing} )
      .pipe( r: %s, w: %s ${second._readableState.flowing} )
      .pipe( stringify R: ${JSON.stringify(stringify._readableState.buffer.length)} )
      .pipe( stringify W: ${JSON.stringify(stringify._writableState.buffer.length)} )
      .pipe( parse R: ${JSON.stringify(parse._readableState.buffer.length)} )
      .pipe( parse W: ${JSON.stringify(parse._writableState.buffer.length)} )
      .pipe( r: %s, w: %s ${third._readableState.flowing} )`,
    new Date(), genR, fr, fw, sr, sw, tr, tw);
  if (genR >= 3) {
    setTimeout(() => {
      clearInterval(logger);
      third.uncork();
    }, 5000);
  }
}, 1000);
