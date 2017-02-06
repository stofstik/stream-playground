function randomString() {
  return Math.random().toString(36).substring(7);
}

function write() {
  setTimeout(() => {
    process.stdout.write(randomString(1000 * Math.random(0, 1000)));
    write();
  }, ~~1000 * Math.random(0, 1));
}

write();
