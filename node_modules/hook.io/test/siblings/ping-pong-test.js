/*
 * test-sibling-callresponse.js: Tests the ability to do a call and response to a sibling
 *                               this input will wait for a sibling to send it a message 
 *                               and then respond back.
 *
 * (C) 2011 Marak Squires, Charlie Robbins
 * MIT LICENCE
 *
 */

var vows = require('vows'),
    assert = require('assert'),
    Hook = require('../../lib/hookio').Hook,
    macros = require('../helpers/macros');

vows.describe('hook.io/siblings/call-response').addBatch({
  "A single-level event ping/pong": macros.assertPingPong(5001, 
    {
      name: 'ping',
      event: 'ping',
      value: 'ping',
    },
    {
      name: 'pong',
      event: 'pong',
      value: 'pong',
    }
  ),
  "A mulit-level event ping/pong": macros.assertPingPong(5004, 
    {
      name: 'ping-multilevel',
      event: 'ping::multilevel',
      value: 'ping::multilevel',
    },
    {
      name: 'pong-multilevel',
      event: 'pong::multilevel',
      value: 'pong::multilevel',
    }
  )
}).export(module);