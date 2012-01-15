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

vows.describe('hook.io/spawn/bad-spawn').addBatch({
  "When a hook is listening on 5023": macros.assertListen('simple-host', 5023, {
    "and we ask it to spawn a bad hook (out of process)": macros.assertSpawnError('hellbadspawn')
    //
    // TODO: Check edge case for bad spawn in process.
    //
  }),
  "When we attempt to spawn a child on a hook that is not listening": macros.assertSpawnError('helloworld')
}).export(module);
