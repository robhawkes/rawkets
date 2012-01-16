/*
 * Creates a helloworld hook, then spawns three helloworld children
 */

var Helloworld = require('hook.io-helloworld').Helloworld;

var myHello = new Helloworld({ name: "helloworld" });

myHello.on('hook::ready', function () {

   // 
   // This will spawn up three more "helloworld" hooks with auto-configuration
   // see: custom-hook-spawn.js for customized spawn settings
   // 
   //
   myHello.spawn(['helloworld', 'helloworld', 'helloworld']);

});

myHello.start();