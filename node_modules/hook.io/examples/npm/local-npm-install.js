/*
 * Creates a hook, then installs the `helloworld` hook from npm
 */

var Hook = require('../../lib/hookio').Hook;

var myHello = new Hook({ name: "the-hook", debug: true });

myHello.on('hook::ready', function () {
   myHello.npm.install('hook.io-helloworld', function (err, result) {
     if (err) {
       return myHello.emit('npm::install::error', err);
     }
     myHello.emit('npm::installed', result);
   });
});

myHello.start();
