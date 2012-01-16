#!/usr/bin/env node

var Hook = require('../../lib/hookio').Hook;

var hook = new Hook( {
  name: 'the-hook',
  debug: true,
  emit: false
});


hook.start();
