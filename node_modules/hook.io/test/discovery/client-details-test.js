/*
 * client-details-test.js: Basic details about hooks for the hook.io module
 *
 * (C) 2011 Marak Squires, Charlie Robbins
 * MIT LICENCE
 *
 */

var vows = require('vows'),
    assert = require('assert'),
    Hook = require('../../lib/hookio').Hook,
    macros = require('../helpers/macros');

vows.describe('hook.io/discovery/client-details').addBatch({
  "When a Hook is listening on port 5011 with 2 client hooks": {
    topic : function () {

      var server = new Hook({
        name:'server',
        type: 'test'
      });

      var self = this;

      server.on('hook::listening', function () {

        var client1 = new Hook({
          name: 'client',
          type: 'test'
        });

        client1.start({ "hook-port": 5011 });

        var client2 = new Hook({
          name: 'another-client',
          type: 'another-test'
        });
        
        client2.on('hook::ready', function onReady () {
          // should add a timeout using addTimeout for handling errors ?
          self.callback(null, server, client1, client2);
        });

        client2.start({ "hook-port": 5011 });

      });

      server.start({ "hook-port": 5011 });
    },
    "and a *client hook* emits *query* asking for details": {
      "about *itself* by *name*": checkDetails(function (err, server, client, client2) {
          var self = this;
          client.emit('query', {
            name : client.name
          }, this.callback);
      }),
      "about the *server* by *name*": checkDetails(function (err, server, client, client2) {
          var self = this;
          client.emit('query', {
            name : server.name
          }, this.callback);
      }),
      "about all hooks of type *test*": checkMultipleDetails(function (err, server, client, client2) {
          var self = this;
          client.emit('query', {
            type : 'test'
          }, this.callback);
      }, ['server','client']),
      "about all hooks on host *127.0.0.1*": checkMultipleDetails(function (err, server, client, client2) {
          var self = this;
          client.emit('query', {
            host : '127.0.0.1'
          }, this.callback);
      }, ['server','client', 'another-client']),
      "about all hooks on host *127.0.0.1*": checkMultipleDetails(function (err, server, client, client2) {
          var self = this;
          client.emit('query', {
            host : '127.0.0.1'
          }, this.callback);
      }, ['server','client', 'another-client'])
    },
    "and the *server hook* emits *query* asking for details": {
      "about *itself* by *name*": checkDetails(function (err, server, client, client2) {
          var self = this;
          server.emit('query', {
            name : server.name
          }, function (err, details) {
            self.callback(err, details, server);
          });
      })
    }
  }
}).export(module);


// macros

function checkDetails (topic) {
  return { 
    topic: topic,
    
    "the callback should get the instance details": function (err, details, client) {
      assert.isObject(details);
    },
    "details should contain the name": function (err, details, client) {
      assert.isString(details.name);
    },
    "details should contain the type": function (err, details, client) {
      assert.isString(details.type);
    },
    "details should contain the host": function (err, details, client) {
      assert.isString(details.remote.host);
    }
  };
}

function checkMultipleDetails (topic, targets) {
  targets = targets || [];

  return  {
    topic: topic,
    
    "the callback should get the instance details": function (err, multipleDetails, client) {
      assert.isArray(multipleDetails);
    },
    "the details should contain the good number of hooks": function (err, multipleDetails, client) {
      assert.strictEqual(multipleDetails.length, targets.length );
    },
    "details should contain the name": function (err, multipleDetails, client) {
      multipleDetails.forEach(function (details) {
        assert.isString(details.name);
      });
    },
    "details should contain the type": function (err, multipleDetails, client) {
      multipleDetails.forEach(function (details) {
        assert.isString(details.type);
      });
    },
    "details should contain the host": function (err, multipleDetails, client) {
      multipleDetails.forEach(function (details) {
        assert.isString(details.remote.host);
      });
    }
  };
}
