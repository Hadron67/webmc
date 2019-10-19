const webmc = require('../');
const net = require('net');

module.exports = argv => {
    let port = 35194, addr;
    if (argv.length){
        addr = argv[0];
        if (argv.length > 1){
            port = Number(argv[1]);
        }
    }
    else {
        console.error('Host address expected');
        return -1;
    }
    let parts = addr.split(':');
    const server = webmc({
        addr,
        port: parts.length === 2 ? Number(parts[1]) : 80,
        decodeMC: true
    });

    const sock = new net.Socket();
    sock.connect({port});
    sock.on('data', d => server.write(d.toString('utf-8')));
}