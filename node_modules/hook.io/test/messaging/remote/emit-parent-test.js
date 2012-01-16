var assert = require('assert'),
    vows = require('vows'),
    Hook = require('../../../lib/hookio').Hook,
    macros = require('../../helpers/macros');

var testData = macros.testData;

vows.describe('hook.io/messaging/remote/emit-parent').addBatch({
  'When a hook is listening on 5120': macros.assertListen('server-hook', 5120, {
    'and another hook connects': macros.assertConnect('client-hook', 5120, {
      'and server emits a test event': {
        'with data': {
          topic: function (client, _, _, server) {
            client.once('*::testEventWithData', this.callback.bind(server, null));
            server.emit('testEventWithData', testData);
          },
          'test event should be fired correctly': function (data) {
            assert.deepEqual(data, testData);
          }
        },
        'without data': {
          topic: function (client, _, _, server) {
            client.once('*::testEventWithoutData', this.callback.bind(server, null));
            server.emit('testEventWithoutData');
          },
          'test event should be fired correctly': function (data) {
            assert.isNull(data);
          }
        }
      }
    })
  })
}).export(module);

