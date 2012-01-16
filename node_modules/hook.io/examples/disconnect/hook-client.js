/*
 * Creates a server hook, 2 client hooks, one client stops listening to the server
 */

var Hook = require('../../lib/hookio').Hook,
    Helloworld = require('hook.io-helloworld').Helloworld;

var hook = new Hook({
  name: "server-hook",
  debug: "true"
});

hook.on('hook::ready', function() {
  setInterval(function() {
    hook.emit('hello', hook.name);
  }, 1000);
});

hook.start();

var client0 = new Helloworld({
  name: "client-hook-0"
});

var client1 = new Helloworld({
  name: "client-hook-1"
});

client0.on('hook::ready', function() {
  setTimeout(function() {
    client0.stop();
  }, 9999);
});

client0.start();
client1.start();
