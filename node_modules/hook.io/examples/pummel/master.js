var Hook = require('../../lib/hookio').Hook;
//var profiler = require('v8-profiler');

var hook = new Hook( {
    name: 'MemLeakMaster',
    silent: true,
    local:true,
    oneway:true
});

hook.on('hook::ready', function () {
  hook.spawn([
    { 
      src: '../emitter.js',
      name:'emitter', 
      silent: true,
      oneway: true
    },
    { src: '../listener.js',name:'listener', silent:true, oneway:true},
    { src: '../listener.js',name:'listener', silent:true, oneway:true}
  ]);
});

hook.start();
