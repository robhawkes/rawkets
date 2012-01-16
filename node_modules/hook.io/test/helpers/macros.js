/*
 * macros.js: Test macros hook.io module
 *
 * (C) 2011 Marak Squires, Charlie Robbins
 * MIT LICENCE
 *
 */

var assert = require('assert'),
    eyes = require('eyes'),
    Hook = require('../../lib/hookio').Hook;

var macros = exports;

macros.testData = {
  nodejitsu: 'hello, I know nodejitsu',
  answer: 42
};

macros.assertListen = function (name, port, vows) {
  var context = {
    topic: function () {
      var instance = new Hook({ name: name });
      instance.on('hook::listening', this.callback.bind(instance, null, instance));
      instance.listen({ "hook-port": port });
    },
    "it should fire the `hook::listening` event": function () {
      assert.equal(this.event, 'hook::listening');      
    }
  };
  
  return extendContext(context, vows);
};

macros.assertConnect = function (name, port, vows) {
  var context = {
    topic: function () {
      var instance = new Hook({ name: name });
      instance.on('hook::connected', this.callback.bind(instance, null, instance));
      instance.connect({ "hook-port": port });
    },
    "should fire the `hook::connected` event": function () {
      assert.equal(this.event, 'hook::connected');
    }
  };
  
  return extendContext(context, vows);
};

macros.assertReady = function (name, port, vows) {
  var context = {
    topic: function () {
      var instance = new Hook({ name: name });
      instance.on('hook::ready', this.callback.bind(instance, null, instance));
      instance.start({ "hook-port": port });
    },
    "should fire the `hook::ready` event": function (_, hook) {
      assert.equal(this.event, 'hook::ready');
    }
  };
  
  return extendContext(context, vows);
};

macros.assertSpawn = function (hooks, local, vows) {
  if (!vows && typeof local === 'object') {
    vows = local;
    local = false;
  }
  
  var context = {
    topic : function (hook) {
      hook.local = local;
      hook.spawn(hooks, this.callback.bind(this, null, hook));
    },
    "it should have spawned children" : function (_, hook) {
      assert.isObject(hook.children);
    },
    "that is called simple" : function (_, hook) {
      assert.isObject(hook.children);
      assert.isObject(hook.children['no-name']);
    },
    "without coughing up an error" : function (err, hook) {
      assert.notEqual(typeof err, 'Error');
      assert.isNull(err);
    }
  }
  
  if (local) {
    context["in local mode"] = function (_, hook) {
      assert.isTrue(hook.local);
    };
  }
  else {
    context["not in local mode"] = function (_, hook) {
      assert.isFalse(!!hook.local);
    };
  }
  
  return extendContext(context, vows);
};

macros.assertHelloWorld = function (local) {
  return macros.assertSpawn({"src": __dirname + "/../fixtures/HelloWorld.js"}, local, {
    "the parent hook": {
      topic: function (host) {
        host.on('*::hello', this.callback.bind(host, null));
      },
      "should emit helloworld": function (_, message) {
        assert.equal(this.event, 'no-name::hello');
        assert.equal(message, 'Hello, I am no-name');
        if (this.children['no-name'].monitor) {
          this.children['no-name'].monitor.stop();
        }
        this.server.close();
      }
    }
  });
};

macros.assertSpawnError = function (hooks, vows) {
  var context = {
    topic : function (hook) {
      if (!hook) {
        hook = new Hook();
      }
      
      hook.once('error::spawn', this.callback.bind(hook, null, hook));
      hook.spawn(hooks);
    },
    "it should raise the `error::spawn` event": function (_, _, err) {
      assert.isObject(err);
      assert.instanceOf(err, Error);
    }
  }  
  
  return extendContext(context, vows);
};

macros.assertPingPong = function (port, ping, pong) {
  var pingContext = {},
      pongContext = {};
  
  pongContext = {
    topic: function (pongHook, _, simpleServer) {
      var pingHook = new Hook({ name: ping.name });

      pongHook.on('*::' + ping.event, function () {
        pongHook.emit(pong.event, pong.value);
      });

      pingHook.on('*::' + pong.event, this.callback.bind(pingHook, null));
      pingHook.on('hook::connected', function () {
        pingHook.emit(ping.event, 'i need a value please');
      });

      pingHook.connect({ "hook-port": port });
    }
  };
  
  pongContext["the pong hook should fire and ping hook should receive '*::" + pong.event + "'"] = function (_, value) {
    assert.isTrue(!!~this.event.indexOf(pong.name));
    assert.isTrue(!!~this.event.indexOf(pong.event));
    assert.equal(pong.value, value);
  };
  
  pingContext["and a ping hook emits '" + ping.event + "'"] = pongContext;
  
  return macros.assertListen('simple-server', port, {
    "and a hook attempts to `.connect()`": macros.assertConnect(pong.name, port, pingContext)
  });
};

function extendContext (context, vows) {
  if (vows) {
    if (vows.topic) {
      console.log('Cannot include topic at top-level of nested vows:');
      eyes.inspect(vows, 'vows');
      process.exit(1);
    }
    
    Object.keys(vows).forEach(function (key) {
      context[key] = vows[key];
    });
  }
  
  return context;
}
