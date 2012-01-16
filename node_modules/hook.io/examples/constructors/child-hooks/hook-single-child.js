
var Hook = require('../../../lib/hookio').Hook;

var hook = new Hook({ 
  name: "hook",
  hooks: ["helloworld"]
});

hook.on('hook::ready', function () {
  console.log('hook ready');
});

hook.start();
