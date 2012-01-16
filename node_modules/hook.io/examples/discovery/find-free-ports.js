/*
 * 
 */

var Hook = require('../../lib/hookio').Hook;


var hook = new Hook({ 
  name: "server-hook",
  debug: true
});


// Default options
hook.findPort(function(err, result){
  console.log(err, result);
})

// Specific port start
hook.findPort({ port: 9000 },function(err, result){
  console.log(err, result);
})

// Specific range
// TODO: Patcy node-portfinder to support max ranges of ports
