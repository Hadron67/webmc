(function(){
    'use strict';
    var output = document.getElementById('console-output');
    var statusLED = document.getElementById('status-led');
    var statusText = document.getElementById('status-text');
    
    var scrollingElement = document.scrollingElement || document.body;
    var decodeMC = true;

    function ajax(opt){
        var xhr = new XMLHttpRequest();
        xhr.open(opt.method || 'GET', opt.url, true);
        xhr.responseType = 'json';
        xhr.addEventListener('readystatechange', function(){
            if (xhr.readyState === XMLHttpRequest.DONE){
                if (xhr.status === 200){
                    opt.success && opt.success(xhr.response);
                }
                else {
                    opt.error && opt.error(xhr.response);
                }
            }
        });
        xhr.send(opt.data || null);
    }

    function node(name, attrs){
        if (attrs === void 0){
            return document.createTextNode(name);
        }
        else {
            var ret = document.createElement(name);
            if (attrs){
                if (attrs.classList){
                    for (var i = 0, _a = attrs.classList; i < _a.length; i++){
                        ret.classList.add(_a[i]);
                    }
                    attrs.classList = void 0;
                }
                else if (attrs.className){
                    ret.classList.add(attrs.className);
                    attrs.className = void 0;
                }
                
                for (var n in attrs){
                    attrs[n] !== void 0 && ret.setAttribute(n, attrs[n]);
                }
            }
            for (var i = 2, _a = arguments; i < _a.length; i++){
                if (typeof _a[i] === 'string'){
                    ret.appendChild(document.createTextNode(_a[i]));
                }
                else
                    ret.appendChild(_a[i]);
            }
            return ret;
        }
    }

    function logEntry(line, content){
        return node('div', {className: 'log-entry'},
            node('a', null, line),
            decodeMC ? mcFormater.decode(content) : node('p', null, content)
        );
    }
    
    function initSocket(addr){
        var socket = new WebSocket('ws://' + addr);
        var retried = false;
        socket.addEventListener('open', function(ev){
            console.log('connection established');
            statusLED.setAttribute('data-status', 'green');
            statusText.innerText = 'Connected';
            output.innerHTML = '';
        });
        socket.addEventListener('message', function(ev){
            var needScroll = scrollingElement.scrollHeight === scrollingElement.scrollTop + window.innerHeight;
            var i = ev.data.indexOf('#');
            var line = ev.data.substr(0, i);
            var text = ev.data.substr(i + 1, ev.data.length - i - 1);
    
            output.appendChild(logEntry(line, text));
            needScroll && window.scrollTo(0, scrollingElement.scrollHeight - window.innerHeight);
        });
        socket.addEventListener('error', function(ev){
            if (!retried) {
                statusLED.setAttribute('data-status', 'red');
                statusText.innerText = 'Error: ' + ev.type;
                socket.close();
                retried = true;
                retry();
            } 
        });
        socket.addEventListener('close', function(){
            if (!retried) {
                statusLED.setAttribute('data-status', 'red');
                statusText.innerText = 'Connection closed';
                retried = true;
                retry();
            } 
        });
    }

    function connect(){
        statusLED.setAttribute('data-status', 'yellow');
        statusText.innerText = 'Retrieving address ...';
        ajax({
            url: '/config',
            success: function(config){
                decodeMC = config.decodeMC;
                statusText.innerText = 'Connecting ...';
                initSocket(config.addr);
            },
            error: function(){
                statusText.innerText = 'Failed to retrieve config';
                statusLED.setAttribute('data-status', 'red');
                retry();
            }
        });
    }

    function retry(){
        setTimeout(connect, 1000);
    }

    connect();

    var mcFormater = (function(){
        var regColor = /[0-9a-f]/, regFormat = /[klmnor]/;
        var obfuscated = [];

        var strDict = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPGRSTUVWXYZ;[]{}|'\".?/\\!@#$%^&*()_-+=";
        function randomString(len){
            var ret = '';
            while (len --> 0){
                ret += strDict.charAt(Math.random() * strDict.length | 0);
            }
            return ret;
        }
        function obfuscatedTick(){
            for (var i = 0, _a = obfuscated; i < _a.length; i++){
                _a[i].innerText = randomString(_a[i].innerText.length);
            }
            requestAnimationFrame(obfuscatedTick, 100);
        }

        obfuscatedTick();

        return {
            decode: decode
        };

        function decode(input){
            function emit(x){
                var text = input.substr(i, x - i);
                var classList = [];
                if (color !== 'f'){
                    classList.push('mc-' + color);
                }
                if (format === 'k'){
                    classList.push('mc-k');
                }
                var nn = classList.length ? node('span', {classList: classList}, text) : node(text);
                format === 'k' && obfuscated.push(nn);
                switch (format){
                    case 'l': nn = node('b', null, nn); break;
                    case 'm': nn = node('s', null, nn); break;
                    case 'n': nn = node('u', null, nn); break;
                    case 'o': nn = node('i', null, nn); break;
                }
                ret.appendChild(nn);
            }
            var ret = node('p', null);
            var i = 0;
            var color = 'f', format = 'r';
            while (i < input.length){
                var x = i;
                while (true){
                    if (input.charAt(x) === '§'){
                        var cc = input.charAt(x + 1);
                        if (regColor.test(cc)){
                            emit(x);
                            i = x + 2;
                            color = cc;
                            break;
                        }
                        else if (regFormat.test(cc)){
                            emit(x);
                            i = x + 2;
                            format = cc;
                            break;
                        }
                        else {
                            x++;
                        }
                    }
                    else if (x >= input.length){
                        emit(x);
                        i = x;
                        break;
                    }
                    else {
                        x++;
                    }
                }
            }
            return ret;
        }
    })();
})();