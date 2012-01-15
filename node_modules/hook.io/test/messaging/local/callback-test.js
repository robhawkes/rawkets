var assert = require('assert'),
    vows = require('vows'),
    Hook = require('../../../lib/hookio').Hook;

var testData = require('../../helpers/macros').testData;

vows.describe('hook.io/messaging/local/callback-test').addBatch({
  'When a hook is listening on 5060': {
    topic: function () {
      var hook = new Hook({ name: 'hook', debug: true });
      hook.on('hook::ready', this.callback.bind(hook, null, hook));

      hook.on('callbackTestEvent', function (data, callback) {
        callback(null, data);
      });

      hook.start({ 'hook-port': 5060 });
    },
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
  }
}).export(module);

