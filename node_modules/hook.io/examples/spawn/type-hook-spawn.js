/*
 * Hook type spawning
 */

var Helloworld = require('hook.io-helloworld').Helloworld;


var myHello = new Helloworld({
  name: "a",
  debug: true
});

myHello.on('hook::ready', function () {

  myHello.spawn([
     {
       type: 'helloworld',
       name: 'b',
       foo: "bar"
     },
     {
       type: 'helloworld',
       name: 'c',
       beep: "boop"
     },
     {
       type: 'helloworld',
       name: 'd'
     }
   ]);

});

myHello.start();