var vows = require('vows'),
    assert = require('assert'),
    Hook = require('../../lib/hookio').Hook,
    macros = require('../helpers/macros');

// Dummy function for event subscription
var emptyFn = function() {};

vows.describe('hook.io/registry/complex-test').addBatch({
  "When a hook is listening on 5013": {
    topic: function() {
      var self = this, server = new Hook({ name: 'server', debug:true });
      
      server.once('hook::ready', self.callback.bind(server, null, server));
      server.on('eventBeforeStart', emptyFn);
      
      server.listen({ "hook-port": 5013 });
    },
    "and another hook connects": {
      topic: function(server) {
        server.on('eventAfterStart', emptyFn);
        server.on('eventAfterStart', emptyFn);
        server.on('eventToBeDestroyed', emptyFn);
        
        var client = new Hook({ name: 'client', debug:true }), self = this;
        client.once('hook::ready', function() {
          self.callback(null, server, client);
        });
        client.on('eventBeforeStart', emptyFn);
        client.on('eventToBeDestroyed', emptyFn);
        
        client.connect({ "hook-port": 5013 });
      },
      "when my hook registers an event": {
        topic: function(server, client) {
          client.on('eventAfterStart', emptyFn);
          server.off('eventToBeDestroyed', emptyFn);
          client.off('eventToBeDestroyed', emptyFn);
          
          // Register a new "testEvent"
          client.on('testEvent', emptyFn);
          
          // Wait a bit for the event to propagate.
          // I'm not completely satisfied with this solution...
          setTimeout(this.callback.bind(this, null, server, client), 50);
        },
        "then I disconnect and reconnect the client": {
          topic: function(server, client) {
            var self = this;
            client.stop(function(err) {
              assert.ifError(err);
              client.connect({ "hook-port": 5013 }, self.callback.bind(self, null, server));
            });
          },
          "then I have a the good events on the server": function(server) {
            // Server checks
            assert.ok(!server._names.server.events['hook::ready']);
            assert.strictEqual(server._names.server.events.eventBeforeStart, 1);
            assert.strictEqual(server._names.server.events.eventAfterStart, 2);
            assert.ok(!server._names.server.events.eventToBeDestroyed);
          },
          "and I have the good events on the client": function(server) {
            // Client checks
            assert.ok(!server._names.client.events['hook::ready']);
            assert.strictEqual(server._names.client.events.testEvent, 1);
            assert.strictEqual(server._names.client.events.eventBeforeStart, 1);
            assert.strictEqual(server._names.client.events.eventAfterStart, 1);
            assert.ok(!server._names.client.events.eventToBeDestroyed);
          }
        }
      }
    }
  }
}).export(module);
