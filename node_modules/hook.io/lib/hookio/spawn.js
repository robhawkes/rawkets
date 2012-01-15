var hookio = require('./hook'),
    async  = require('async'),
    path   = require('path');

exports.spawn = function (hooks, callback) {
  var self = this,
      connections = 0,
      local,
      names;

  function onError (err) {

    //
    // Remark: Would it make sense to throw here?
    // We should have a better idea of the spawn error,
    // is it possible to get into a bad state if we have a failed spawn?
    //
    self.emit('error::spawn', err);
    if (callback) {
      callback(err);
    }
  }
  
  if (!this.listening) {
    return onError(new Error('Cannot spawn child hooks without calling `.listen()`'));
  }  

  if (typeof hooks === "string") {
    hooks = new Array(hooks);
  }

  if (!(hooks instanceof Array) && typeof hooks === 'object'){
    hooks = new Array(hooks);
  }

  types = {};
  
  if (typeof hookio.forever === 'undefined') {
    //
    // Attempt to `require('forever')` and if it is available
    // then spawn all 
    //
    try {
      hookio.forever = require('forever');
    }
    catch (ex) {
      //
      // Remark: Should we be warning the user here?
      //
      hookio.forever = ex;
    }
  }
  
  //
  // Spawn in-process (i.e. locally) if `hookio.forever` has been set
  // purposefully to `false` or if it is an instance of an `Error` 
  // (i.e. it had previously failed to be required). 
  //
  local = self.local || !hookio.forever || hookio.forever instanceof Error;

  function spawnHook (hook, next) {
    var hookPath,
        hookBin = __dirname + '/../../bin/forever-shim',
        options,
        child,
        keys;

    if (typeof hook === 'string') {
      hook = {
        name: self.defaults.name,
        type: hook
      };
    }

    hook['host'] = hook['host'] || self['hook-host'];
    hook['port'] = hook['port'] || self['hook-port'];
    hook['name'] = hook['name'] || self.defaults.name;

    //
    // Remark: hook.src is a direct path to any hook
    //
    if (hook.src) {
      hookPath = hook.src;
    }
    //
    // Remark: hook.type is the type of hook, this will use NPM's
    // dependency tree to attempt the require lookup
    //
    if (hook.type) {
      hookPath = 'hook.io-' + hook.type;
    }
    try {
      require.resolve(hookPath);
    }
    catch (ex) {
      //
      // If for some reason, we can't find the hook,
      // return an error
      //
      return next(ex);
    }

    self.emit('hook::spawning', hook.name);

    if (local) {

      //
      // Create empty object in memory and dynamically require hook module from npm
      //
      self.children[hook.name] = {
        module: require(hookPath)
      };

      //
      // Here we assume that the `module.exports` of any given `hook.io-*` module
      // has **exactly** one key. We extract this Hook prototype and instantiate it.
      //
      keys = Object.keys(self.children[hook.name].module);
      self.children[hook.name].Hook  = self.children[hook.name].module[keys[0]];
      self.children[hook.name]._hook = new (self.children[hook.name].Hook)(hook);

      //
      // When the hook has fired the `hook::ready` event then continue.
      //
      self.children[hook.name]._hook.once('hook::ready', next.bind(null, null));
      self.children[hook.name]._hook.connect(self);
    }
    else {

      //
      // TODO: Make `max` and `silent` configurable through the `hook.config`
      // or another global config.
      //
      options = {
        max: 10,
        silent: false,
        logFile: path.join('./forever-' + hook.type + '-' + hook.name)
      };

      options.options = self._cliOptions(hook);

      child = new (hookio.forever.Monitor)(hookBin, options);
      child.on('start', function onStart (_, data) {
        //
        // Bind the child into the children and move on to the next hook
        //
        self.children[hook.name] = {
          bin: hookBin,
          monitor: child
        };
        
        self.emit('child::start', hook.name, self.children[hook.name]);
        next();
      });
      
      child.on('restart', function () {
        self.emit('child::restart', hook.name, self.children[hook.name]);
      });
      
      child.on('exit', function (err) {
        //
        // Remark: This is not necessarily a bad thing. Hooks are not by definition
        // long lived processes (i.e. worker-hooks, tbd).
        //
        self.emit('child::exit', hook.name, self.children[hook.name]);
      });

      child.start(); 
    }
  }
  
  self.many('*::hook::ready', hooks.length,  function () {
    connections++;
    //
    // If we have spawned the correct amount of hooks,
    // then we will emit `children::ready`
    //
    if (connections === hooks.length) {
      self.emit('children::ready', hooks);
      //self.off('client::connected', onConnect);
    }
  });

  async.forEach(hooks, spawnHook, function (err) {
    if (err) {
      return onError(err);
    }

    self.emit('children::spawned', hooks);
    if (callback) {
      callback();
    }
  });
  
  return this;
};