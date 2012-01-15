/*
 * Creates a helloworld hook, then spawns three helloworld children
 */

var Hook = require('../../../lib/hookio').Hook;

var pingPongModule = require('../../../test/fixtures/pingPongModule.js');

var myHook = new Hook({ 
  name: "event-map-hook",
  events: {
    "*::ping" : pingPongModule.ping,
    "*::customPing" : function (msg) {
      console.log('custom ping');
      msg = 'foo ' + msg;
      pingPongModule.ping(msg);
    }
  }
});

myHook.on('hook::ready', function () {
  console.log('ready');
});

myHook.start();
