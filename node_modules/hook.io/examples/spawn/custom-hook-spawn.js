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
       src: '../../test/fixtures/HelloWorld',
       name: 'b',
       foo: "bar"
     },
     {
       src: '../../test/fixtures/HelloWorld',
       name: 'c',
       beep: "boop"
     },
     {
       src: '../../test/fixtures/HelloWorld',
       name: 'd'
     }
   ]);

});

myHello.start();