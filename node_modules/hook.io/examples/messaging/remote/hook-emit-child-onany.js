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

hook2.onAny(function (data, callback) {
  console.log(this.event, data);
})

console.log(hook1.getEvents());

hook1.on('hook::ready', function () {
  hook2.start();
  hook2.on('hook::ready', function () {
    hook1.emit('hello', 'world');
  });
});

hook1.start();