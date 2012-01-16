/*
 * Creates a hook, spawns up three custom hooks, then queries the hook cloud for information
 */

var Hook = require('../../lib/hookio').Hook;


var hook1 = new Hook({ 
  name: "server-hook"
});

hook1.on('hook::ready', function () {

  hook1.on('children::ready', function () {
    
    //
    // Remark: Get all hooks of generic type "hook" with a callback
    //
    hook1.emit('query', { "type": "hook" }, function (err, result) {
      console.log('hook query result:'.green.bold.underline + ' ' + JSON.stringify(result, true, 2).grey);
    });

    //
    // Remark: Get all hooks of generic type "hook" with an emitter
    //
    hook1.on('query::result', function (result) {
      console.log('hook query result:'.green.bold.underline + ' ' + JSON.stringify(result, true, 2).grey);
    });

    hook1.emit('query', { "type":"hook" });

  });

  //
  //  Remark: Spawn up three child hooks with custom options
  //
  
  hook1.spawn([
     {
       type: 'hook',
       name: 'b',
       foo: "bar"
     },
     {
       type: 'hook',
       name: 'c',
       beep: "boop"
     },
     {
       type: 'hook',
       name: 'd'
     }
   ]);
  
});

hook1.start();
