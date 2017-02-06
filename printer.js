// Try with: '( cat /dev/urandom  ) | node printer.js' : ) hehehe
process.stdin.on('readable', () => {
  var buf = process.stdin.read(16);
  console.log(buf);
  console.log(buf.toString('utf-8'));
  process.stdin.read(0);
  // TODO write to sockets
});
