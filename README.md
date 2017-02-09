# Node Stream Playground

### About
Just messing around with node streams.  
```javascript
const server = net.createServer((socket) => {
  sensible.pipe(socket);
});
```
- A readable stream generates some data.
- This gets data then gets piped to all connecting sockets

Attachable to my node service registry https://github.com/stofstik/service-registry  
So sockets can easily connect to it and listen to the generated data.

### WIP
Definitely needs work, error checking, pull based, best practices etc.

### Get running
- `npm install`
- `node app.js`
