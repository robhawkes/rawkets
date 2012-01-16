/*
 * 
 */

var Hook = require('../../lib/hookio').Hook;


var hook1 = new Hook({ 
  name: "server-hook",
  debug: true
});

var hook2 = new Hook({ 
  name: "callback-hook",
  debug: true
});


hook1.on('hook::ready', function () {
  console.log('hook1 is ready');
  hook2.on('hook::ready', function () {
    console.log('hook2 is ready');
  });
  hook2.start();
});

hook1.start();