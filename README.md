# Node Stream Playground

### About
Just messing around with node streams.  
```javascript
const server = net.createServer((socket) => {
  // When a new socket connection starts pipe data from a readable stream to it
  sensible.pipe(socket);
});
```
- A readable stream generates some data.
- Gets piped to a transform stream to _lolzify_ it.
- Then gets piped to a to a stringify transform stream.
- This gets data then gets written to all connected sockets.
- And finally it gets piped to a writable stream which console.logs the data.  

Attachable to my node service registry https://github.com/stofstik/service-registry  
So sockets can easily connect to it and listen to the generated data.

### WIP
Definitely needs work, error checking, best practices etc.

### Get running
- `npm install`
- `node app.js`
