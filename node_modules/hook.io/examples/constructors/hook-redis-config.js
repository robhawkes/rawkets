
var Hook = require('../../lib/hookio').Hook;

var hook = new Hook({
  redis: {
    host: 'localhost',
    port: 6379,
    db: 0,
    namespace: 'hookio'
  }
});

/*
  We have the following redis keys in our redis db
   * hookio:name -> 'myhook'
   * hookio:type -> 'hook'

  It is equivalent to

  var hook = new Hook({
    name: 'myhook',
    type: 'hook'
  });
*/

hook.on('hook::ready', function () {
  console.log('hook ready');
});

hook.start();
