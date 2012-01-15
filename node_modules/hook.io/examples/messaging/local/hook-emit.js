/*
 * Simple example for basic Hook.emit syntax
 */

var Hook = require('../../../lib/hookio').Hook;


var hook1 = new Hook({ 
  name: "server-hook",
  debug: true
});

hook1.on('hello', function (data, callback) {
  console.log('calling result back ', data);
  callback(null, data);
})

hook1.on('hook::ready', function () {
  hook1.on('hello::result', function (data) {
    console.log('got back ', data);
  });
  hook1.emit('hello', 'world');
});

hook1.start();