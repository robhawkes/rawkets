/*
 * Creates a server hook, spawn a client hook, kill the spawned client
 */

var Hook = require('../../lib/hookio').Hook;

var hook = new Hook({
  name: "server-hook",
  debug: "true",
  hooks: [
    {
      name: "client-hook",
      type: "helloworld",
      debug: "true"
    }
  ]
});

hook.on('hook::ready', function() {
  setInterval(function() {
    hook.emit('hello', hook.name);
  }, 1000);
  setTimeout(function() {
    hook.kill('client-hook');
  }, 9999);
});

hook.start();
