var vows = require('vows'),
    assert = require('assert'),
    Hook = require('../../lib/hookio').Hook,
    macros = require('../helpers/macros');

var emptyFn = function() {};

vows.describe('hook.io/registry/simple-test').addBatch({
  "When a hook is listening on 5014": {
    topic: function() {
      var server = new Hook({ name: 'server', debug:true });
      server.on('hook::ready', this.callback.bind(server, null, server));
      server.on('serverTestEvent', emptyFn);
      server.listen({ "hook-port": 5014 });
    },
    "and another hook connects": {
      topic: function(server) {
        var client = new Hook({ name: 'client', debug:true });
        client.connect({ "hook-port": 5014 }, this.callback.bind(client, null, server, client));
      },
      "when my hook registers an event": {
        topic: function(server, client) {
          // Register a new "testEvent"
          client.on('testEvent', emptyFn);
          
          // Wait a bit for the event to propagate.
          // I'm not completely satisfied with this solution...
          setTimeout(this.callback.bind(this, null, server), 50);
        },
        "then I have that new listener registered": function(server) {
          assert.ok(server._names.client.events.testEvent);
        },
        "and I also have server events registered": function(server) {
          assert.ok(server._names.server.events.serverTestEvent);
        }
      }
    }
  }
}).export(module);
