/*
 * multiple-messages-test.js: Test the ability to work with multiple hook and rather important message passing
 *                            to demonstrate some heavier network usage.
 *
 *                            This test suite init and start a server hook with a predefined number
 *                            of clients, emiting back and fourth data
 *
 * (C) 2011 Marak Squires, Charlie Robbins
 * MIT LICENCE
 *
 */

var vows = require('vows'),
    assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    Hook = require('../../lib/hookio').Hook,
    macros = require('../helpers/macros'),
    EventEmitter = require('events').EventEmitter;


//
//  TODO: Update fixture with a large binary file, or something
//
var fixture = '', i;
for (i = 0; i < 5000; i++) {
  fixture += '#';
}

// create a local macro
// TODO: see if it's better to put this in helpers/macros
var macro = function (event, port) {

  var context = {
    topic: function (server, data) {
      var messager = new Hook({ name: 'simple-client-messager' });

      server.once('*::' + event, function (data) {
        server.emit('foo::response.' + event, data);
      });

      messager.once('*::response.' + event, this.callback.bind(server, null));

      messager.once('hook::connected', function () {
        messager.emit(event, {content: fixture});
      });
      messager.connect({ 'hook-port': port });

    }
  };

  context["the simple-listener-"+event+"::* event should be fired correctly"] = function (data) {
    assert.equal(data.content, fixture);
  };

  return context;
};

// creates a context with a preder 
macro.multipleSubscriber = function (prefix, count) {
  var context = {},
      test = count;

  context["to listen with wildcard mapping"] = {
    topic: function () {
      var listener = new Hook({ name: 'simple-listener-'+test }),
          self = this,
          length = count - 1,
          timeouts = [];

      // This test fails unless this is uncommented.
      //listener.on('*::test::*::*', function log () {
      //  return;
      //});

      for (var i = 1; i <= count; i++) {
        (function () {
          // If this timeout occurs it means the test failed.
          timeouts[i] = setTimeout(function () {
            // I suspect that there's a better way to do this.
            throw new Error("simple-client-messager-"+test+" never fired.");
          }, 5000);

          listener.on('simple-client-messager-'+test+ '::test::*::*', function log () {
            // Ensures the callback fired.
            clearTimeout(timeouts[i]);

            if (--length === 0) self.callback();
          });
        })();
      }
      listener.connect({ 'hook-port': 5053 });

    },

    "should be able to listen each of the emitted event": function () {
      assert.ok(true);
    }
  };

  while(--test) {
    context["to emit simple-listener-"+test+"::" + prefix + test] = macro(prefix + test, 5053);
  }

  return context;
};


// Start the batch with a with a predefined number of cycles
vows.describe('hook.io/siblings/multiple-message-hooknames').addBatch({
  "When a hook is listening on 5053": macros.assertListen('simple-server', 5053, {
    "and another hooks connects": macro.multipleSubscriber('test::foo::', 10)
  })
}).export(module);

