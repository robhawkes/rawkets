/*
 *  Creates `hook1` and `hook2`. `hook1` then remotely installs a NPM package on `hook2`
 */

var Hook = require('../../lib/hookio').Hook;

var hook1 = new Hook({ 
  name: "hook1", 
  debug: true 
});

hook1.on('hook::ready', function () {
  
  var hook2 = new Hook({ 
    name: "hook2", 
    debug: true 
  });
  
  hook2.start();
  
  hook2.on('hook::ready', function () {
    hook1.emit('install', 'hook.io-helloworld');
  });
  
});

hook1.start();
