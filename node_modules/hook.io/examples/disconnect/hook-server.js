/*
 * Creates a server hook, spawns 2 client hooks, stops listening as server
 */

var Hook = require('../../lib/hookio').Hook;

var hook = new Hook({
  name: "server-hook",
  debug: "true",
  hooks: [
    {
      type: "helloworld",
      name: "client-hook-0"
    },
    {
      type: "helloworld",
      name: "client-hook-1"
    }
  ]
});

hook.on('hook::ready', function() {
  setInterval(function() {
    hook.emit('hello', hook.name);
  }, 1000);

  setTimeout(function() {
    hook.stop();
  }, 9999);
});

hook.start();
