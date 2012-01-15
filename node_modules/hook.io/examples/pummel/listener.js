var Hook = require('../../lib/hookio').Hook;
var util = require('util');

var Slave = exports.Slave = function (options) {
  self = this;
  Hook.call(this, options);
  this.on('hook::ready', function () {
    this.on('*::someEvent', function (msg) {
    })
  }); 
}

util.inherits(Slave, Hook);