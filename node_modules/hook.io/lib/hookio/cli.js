/*
 * cli.js: Wrapper tools for `optimist` in hookio so children do not need this dependency.
 *
 * (C) 2011 Nodejitsu Inc.
 * MIT LICENCE
 *
 */

var optimist = require('optimist');

var defaultOptions = {
  debug: {
    description: 'Indicates if this hook process will be debugged',
    boolean: true,
    default: false
  },
  'hook-port': {
    description: 'Port that the hook process should listen on',
    number: true,
    default: 5000
  },
  'hook-host': {
    description: 'Host that the hook process should listen on',
    string: true,
    default: '127.0.0.1'
  },
  'hook-socket': {
    description: 'Socket path that the hook process should listen on',
    default: null
  }
};

exports.options = function (options, argv) {
  var parsed = argv ? optimist(argv) : optimist;
  return parsed.options(defaultOptions).options(options);
};

Object.defineProperty(exports, 'argv', {
  get: function () {
    return optimist.options(defaultOptions).argv;
  }
});