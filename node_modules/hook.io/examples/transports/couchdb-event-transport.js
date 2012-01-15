/*
 * Creates a hook and spawns a helloworld child both with an additional CouchDB transport
 */

var Hook = require('../../lib/hookio').Hook;


var myHook = new Hook({ 
  name: "event-transport-hook",
  debug: true,
  transports: [
    { 
      "type" : "couchdb",
      "options": {
        "host": "localhost",
        "port": 5984,
        "db": "mydatabase"
      }
    }
  ]
});

myHook.on('hook::ready', function () {

  myHook.spawn([{
    name: "event-transport-hook-child",
    type: "helloworld",
    debug: true,
    transports: [
      { 
        "type" : "couchdb",
        "options": {
          "host": "localhost",
          "port": 5984,
          "db": "mydatabase"
        }
      }
    ]
  }]);
  
  myHook.on('children::ready', function () {

    //
    // Remark: Since we have set couch as an transport,
    // the event will be copied and also sent to CouchDB
    //
    myHook.emit('someevent', { "foo": "bar" });
    
  });

});

myHook.start();
