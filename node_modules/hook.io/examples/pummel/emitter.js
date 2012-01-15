var Hook = require('../../lib/hookio').Hook;
var util = require('util');

var fixture = '', i;
for (i = 0; i < 5000; i++) {
  fixture += '#';
}

var RealMessage = function () {
  this.bigData = fixture;
}

var Slave = exports.Slave = function (options) {
  self = this;
  var count = 0;
  Hook.call(this, options);
  
  function emitEvent () {
    count++;
    self.emit("someEvent",new RealMessage());
    if (count==100) {
      count = 0;
      console.log(process.memoryUsage().rss);
      setTimeout(emitEvent, 20);
    } else
      setTimeout(emitEvent, 5);
  }
    
  this.on('hook::ready', function () {
    emitEvent();
  }); 
}

util.inherits(Slave, Hook);
