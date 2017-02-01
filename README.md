# Node Stream Playground

### About
Just messing around with node streams.  
```javascript
gen.pipe(lolzify).pipe(stringify).pipe(print);
stringify.on('data', (data) => {
  sockets.map((s) => {
    s.write(data);
  });
});
```
- A readable stream generates some data.
- Gets piped to a transform stream to _lolzify_ it.
- Then gets piped to a to a stringify transform stream.
- This gets data then gets written to all connected sockets.
- And finally it gets piped to a printer which console.logs the data.  

Attachable to my node service registry https://github.com/stofstik/service-registry  
So sockets can easily connect to it and listen to the generated data.

### WIP
Definitely needs work, error checking, best practices etc.

### Get running
- `npm install`
- `node app.js`
