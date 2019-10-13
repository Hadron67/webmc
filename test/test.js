const createServer = require('../');

async function main(){
    let s = createServer({
        addr: 'localhost:8080',
        port: 8080,
        decodeMC: true
    });

    // let ctx = new jmcl.Context(console, 'info');
    // ctx.config.home = '/home/cfy';
    // ctx.config.mcRoot = '.minecraft';
    // ctx.launcherName = 'jmcl';
    // ctx.launcherVersion = '1.0.0';

    // let prc = await jmcl.launch(ctx, {
    //     uname: 'chenfeyu@gmail.com',
    //     version: '1.12.2',
    //     // offline: true
    // });
    // prc.stdout.on('data', d => s.write(d));

    // let line = 1;
    // setInterval(() => s.write('message000000   000 0000 000000 000000 0000000000 00000000000000000000000000000000000000000000000000000000000000000000000000!'), 1000);
    setInterval(() => s.write('color §7test§f. §kh§r§f 123456'), 1000);
}

main();