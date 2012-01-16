/*
 * hookio.js: Top-level include for the hookio module.
 *
 * (C) 2011 Nodejitsu Inc.
 * MIT LICENCE
 *
 */

var hookio = exports;

//
// Export the core `hookio` components.
//
hookio.cli  = require('./hookio/cli');
hookio.Hook = require('./hookio/hook').Hook;
