const http = require('http');
const url = require('url');
const fs = require('fs');
const ws = require('ws');
const pathd = require('path');
const mime = require('mime');
const readline = require('readline');

function createServer(opt){
    const webRoot = pathd.join(__dirname, 'public');
    if (opt.addr){
        opt.getAddr = cb => cb(opt.addr);
    }
    
    let server = http.createServer((req, res) => {
        let path = url.parse(req.url).pathname;
        if (path === '/') path = '/index.html';
        if (path === '/config'){
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            opt.getAddr(addr => {
                res.end(JSON.stringify({
                    addr,
                    decodeMC: opt.decodeMC
                }));
            });
        }
        else {
            path = pathd.join(webRoot, path);
            let contentType = mime.getType(path);
            fs.exists(path, e => {
                if (e){
                    res.statusCode = 200;
                    res.setHeader('Content-Type', contentType);
                    fs.createReadStream(path).pipe(res);
                }
                else {
                    res.statusCode = 404;
                    res.end('<h1>QuatreCentQuatre</h1>');
                }
            });
        }
    });
    
    let connections = [];
    let dataBuff = [];
    let wsServer = new ws.Server({server});
    wsServer.on('connection', ws => {
        let id = connections.length;
        console.log(`new connection #${id}`);
        ws.on('close', () => console.log(`connection #${id} closed`));
        connections.push(ws);

        for (let {line, data} of dataBuff){
            ws.send(line + '#' + data);
        }
    });

    server.listen(opt.port, () => console.log('server started'));

    let line = 1;
    function addData(line, data){
        dataBuff.push({line, data});
        if (dataBuff.length > opt.buffSize){
            dataBuff.shift();
        }
    }
    function write(data){
        for (let dataLine of data.split('\n')){
            if (dataLine){
                addData(line, dataLine);
                for (let conn of connections){
                    conn.send(line + '#' + dataLine);
                }
                line++;
            }
        }
    }
    function setAddr(a){
        opt.addr = a;
    }

    return {write, setAddr};
}

module.exports = createServer;

