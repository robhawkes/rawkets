/*
 * Simple example for basic Hook.emit syntax
 */

var Hook = require('../../../lib/hookio').Hook;


var hook1 = new Hook({ 
  name: "server-hook",
  debug: true
});

var hook2 = new Hook({ 
  name: "callback-hook",
  debug: true
});

hook1.on('*::hello', function (data, callback) {
  console.log('calling result back ', data);
  callback(null, data);
})

hook1.on('hook::ready', function () {
  hook2.start();
  hook2.on('hook::ready', function () {
    hook2.on('hello::result', function (data) {
      console.log('result is back ', data);
    });
    hook2.emit('hello', 'world');
  });
});

hook1.start();