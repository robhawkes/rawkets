/*
 * test-sibling-callresponse.js: Test the ability to start up an output hook that other hooks can connect to
 *                               this output will receive and rebroadcast messages to all its children 
 *                               (which are siblings to each other).
 *
 * (C) 2011 Marak Squires, Charlie Robbins
 * MIT LICENCE
 *
 */

var vows = require('vows'),
    assert = require('assert'),
    Hook = require('../../lib/hookio').Hook,
    macros = require('../helpers/macros');
    
vows.describe('hook.io/siblings/message').addBatch({
  "When a hook is listening on 5002": macros.assertListen('simple-server', 5002, {
    "and another hook connects": macros.assertConnect('simple-subscriber', 5002, {
      "and emits *::test": {
        topic: function (subscriber) {
          subscriber.once('*::test', this.callback.bind(subscriber, null));

          var messager = new Hook({ name: 'simple-client-messager' });
          messager.connect({ "hook-port": 5002 });
          messager.once('hook::connected', function () {
            messager.emit('test', 'hello there!');
          });
        },
        "the *::test event should be fired correctly": function (_, data) {
          assert.equal(data, 'hello there!');
        }
      }
    })
  })
}).export(module);

