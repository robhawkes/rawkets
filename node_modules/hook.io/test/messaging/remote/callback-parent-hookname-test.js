var assert = require('assert'),
    vows = require('vows'),
    Hook = require('../../../lib/hookio').Hook,
    macros = require('../../helpers/macros');

var testData = macros.testData;

vows.describe('hook.io/messaging/remote/callback-parent-test').addBatch({
  'When a hook is listening on 5081': macros.assertListen('server-hook', 5081, {
    'and another hook connects': {
      topic: function (server) {
        var client = new Hook({ name: 'client-hook', debug: true });
        client.on('hook::connected', this.callback.bind(client, null, client, server));

        client.on('server-hook::*', function (data, callback) {
          callback(null, data);
        });

        client.connect({ 'hook-port': 5081 });
      },
      'and server emits a test event': {
        'with data': {
          topic: function (client, server) {
            server.emit('callbackTestEvent', testData, this.callback);
          },
          'he should receive a callback with correct data': function (data) {
            assert.deepEqual(data, testData);
          }
        },
        'without data': {
          topic: function (client, server) {
            server.emit('callbackTestEvent', this.callback);
          },
          'he should receive a callback without any data': function (data) {
            assert.isNull(data);
          }
        }
      }
    }
  })
}).export(module);

