var assert = require('assert'),
    vows = require('vows'),
    Hook = require('../../../lib/hookio').Hook,
    macros = require('../../helpers/macros');

var testData = macros.testData;

vows.describe('hook.io/messaging/remote/emit-child').addBatch({
  'When a hook is listening on 5110': macros.assertListen('server-hook', 5110, {
    'and another hook connects': macros.assertConnect('client-hook', 5110, {
      'and emits a test event': {
        'with data': {
          topic: function (client, _, _, server) {
            server.once('*::testEventWithData', this.callback.bind(server, null));
            client.emit('testEventWithData', testData);
          },
          'test event should be fired correctly': function (data) {
            assert.deepEqual(data, testData);
          }
        },
        'without data': {
          topic: function (client, _, _, server) {
            server.once('*::testEventWithoutData', this.callback.bind(server, null));
            client.emit('testEventWithoutData');
          },
          'test event should be fired correctly': function (data) {
            assert.isNull(data);
          }
        }
      }
    })
  })
}).export(module);

