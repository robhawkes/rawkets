/*
 * Simple Hook-io plugin
 */

var Hook = require('hook.io').Hook,
    util = require('util');


var Helloworld = exports.Helloworld = function (options) {

  var self = this;
  Hook.call(this, options);
  
  console.log(options);
  
  this.on('hook::ready', function () {
    self.on('*::hello', function(data){

      console.log(data);

    });

    //
    // This is just to simulate I/O, don't use timers...
    //
    setInterval(function () {
      self.emit('hello', 'Hello, I am ' + self.name);
    }, 1000);

  });
};

//
// Inherit from `hookio.Hook`
//
util.inherits(Helloworld, Hook);
