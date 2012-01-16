/*
 * Creates a helloworld hook, then spawns up a single helloworld child
 */

var Helloworld = require('hook.io-helloworld').Helloworld;

var myHello = new Helloworld({ name: "helloworld" });

myHello.on('hook::ready', function () {

   // 
   // This will spawn up one "helloworld" hook with auto-configuration
   // see: custom-hook-spawn.js for customized spawn settings
   // 
   //
   myHello.spawn('helloworld');

});

myHello.start();