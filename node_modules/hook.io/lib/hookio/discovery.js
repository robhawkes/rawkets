var hookio     = require('./hook'),
    async      = require('async'),
    path       = require('path'),
    portfinder = require('portfinder'),
    discovery  = exports;

discovery.ports = {};

discovery.ports.find =  portfinder.getPort;


