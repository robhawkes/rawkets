/*
 * test-basic-test.js: Basic tests for the hook.io module
 *
 * (C) 2011 Marak Squires, Charlie Robbins
 * MIT LICENCE
 *
 */

var vows = require('vows'),
    assert = require('assert'),
    Hook = require('../../lib/hookio').Hook,
    macros = require('../helpers/macros');

vows.describe('hook.io/discovery/basic-init').addBatch({
  "When a Hook is listening on 5010": macros.assertListen('simple-listen', 5010, {
    "and another hook attempts to `.connect()`": macros.assertConnect('simple-connect', 5010),
    "and another hook attempts to `.start()`": macros.assertReady('simple-start', 5010)
  })
}).addBatch({
  "When a Hook is listening on 5010": {
    "and another hook attempts to `.listen()` on 5010": {
      topic: function () {
        var instance = new Hook({ name: 'simple-error' });
        instance.once('error::*', this.callback.bind(instance, null));
        instance.listen({ "hook-port": 5010, debug:true });
      },
      "it should fire the `error` event": function (_, data) {
        assert.equal(this.event, 'error::bind');
        assert.equal(data, '5010');
      }
    }
  }
}).addBatch({
  "When a Hook is listening on 5010": {
    "and another hook attempts to `.listen()` on 5010": {
      topic: function () {
        var instance = new Hook({ name: 'simple-error-callback', debug:true });
        instance.listen({ "hook-port": 5010 }, this.callback.bind(instance, null));
      },
      "it should return an error ": function (_, err) {
        assert.isObject(err);
      },
      "error should be EADDRINUSE": function (_, err) {
        assert.equal(err.code, 'EADDRINUSE');     
      }
    }
  }
}).export(module);
