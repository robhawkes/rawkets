var Hook = require('../../../lib/hookio').Hook;

var hook = new Hook({ 
  name: "hook",
  hooks: [
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
   ]
});

hook.on('hook::ready', function () {
  console.log('hook ready');
});

hook.start();
