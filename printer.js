process.stdin.on('readable', () => {
  var buf = process.stdin.read(16);
  console.log(buf);
  process.stdin.read(0);
});
