var assert = require('assert'),
    vows = require('vows'),
    Hook = require('../../../lib/hookio').Hook,
    macros = require('../../helpers/macros');

var testData = macros.testData;

vows.describe('hook.io/messaging/remote/callback-child-hookname-test').addBatch({
  'When a hook is listening on 5071': {
    topic: function () {
      var hook = new Hook({ name: 'hook', debug: true });
      hook.on('hook::ready', this.callback.bind(hook, null, hook));

      // This is different from callback-child-test because it listens for
      // "client-hook::*" instead of "*::callbackTestEvent".
      hook.on('client-hook::*', function (data, callback) {
        callback(null, data);
      });

      hook.listen({ 'hook-port': 5071 });
    },
    'and another hook connects': macros.assertConnect('client-hook', 5071, {
      'and it emits a test event': {
        'with data': {
          topic: function (hook) {
            hook.emit('callbackTestEvent', testData, this.callback);
          },
          'he should receive a callback with correct data': function (data) {
            assert.deepEqual(data, testData);
          }
        },
        'without any data': {
          topic: function (hook) {
            hook.emit('callbackTestEvent', this.callback);
          },
          'he should receive a callback without any data': function (data) {
            assert.isNull(data);
          }
        }
      }
    })
  }
}).export(module);

