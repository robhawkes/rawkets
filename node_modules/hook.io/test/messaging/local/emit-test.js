var assert = require('assert'),
    vows = require('vows'),
    Hook = require('../../../lib/hookio').Hook,
    macros = require('../../helpers/macros');

var testData = macros.testData;

vows.describe('hook.io/messaging/local/emit-test').addBatch({
  'When a hook is started on port 5100': macros.assertReady('test-hook', 5100, {
    'and it emits a test event': {
      'with data': {
        topic: function (hook) {
          hook.once('testEvent', this.callback.bind(hook, null));
          hook.emit('testEvent', testData);
        },
        'event hook should ba called with correct data': function (data) {
          assert.deepEqual(data, testData);
        }
      },
      'without data': {
        topic: function (hook) {
          hook.once('testEvent', this.callback.bind(hook, null));
          hook.emit('testEvent');
        },
        'event hook should be called without any data': function (data) {
          assert.isUndefined(data);
        }
      }
    }
  })
}).export(module);

