/*
 * Creates a helloworld hook, then spawns three helloworld children
 */

var Hook = require('../../../lib/hookio').Hook;


var hook1 = new Hook({ 
  name: "a",
  debug: true
});

var hook2 = new Hook({ 
  name: "b",
  debug: true
});


hook2.on('a::*', function (data, callback) {

  //
  // callback is the callback for this event,
  // should it exist
  //
  var result = {
    "text": "Why hello there!"
  };
  
  callback(null, result);

});

hook1.on('hook::ready', function () {
  
  hook2.start();
  
  hook2.on('hook::ready', function () {

    //
    // Event with data
    // event, data, callback
    //
    hook1.emit('hello', 'data1', function (err, data) {
      console.log('callback1 ', err, data);
    });

    //
    // Event with data
    // event, data, callback
    //
    hook1.emit('hello', {"foo":"bar"}, function (err, data) {
      console.log('callback2 ', err, data);
    });

    //
    // Event with no data
    // event, callback
    //
    hook1.emit('hello', function (err, data) {
      console.log('callback3 ', err, data);
    });

  });
  
});

hook1.start();
