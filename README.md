# webmc

[![npm version](https://img.shields.io/npm/v/pnpm.svg)](https://www.npmjs.com/package/webmc)

Display the output of a process in browsers.

![Demo](demo.png)

## Original purpose
This programme was originally used by me to display Minecraft log text when queueing in [2b2t](//2b2t.org), so I could see my position in queue when away from computer, such as when going out for dinner.

## Usage
The CLI program is piping the output of a local port to a websocket so that can be viewed in browsers. The local port could be created by [jmcl](https://github.com/Hadron67/jmcl), which is what I usually do. 

### API
```js

const createServer = require('webmc');

const server = createServer({
    addr: 'localhost:8080', // server address, used in websocket handshake, port number must be consistent with `port'
    port: 8080, // server port
    decodeMC: true // whether to decode Minecraft color code
});

const childProcess = /* Create a child process, could be Minecraft */;

prc.stdout.on('data', data => server.write(data));

```