/*
 * npm-api.js: Wrapper for NPM ( Node Package Manager )
 *
 * (C) 2011 Nodejitsu Inc.
 * MIT LICENCE
 *
 */


var npm       = exports,
    npmModule = require('npm');

//
// ### function getHooks (searchKey, callback)
// #### @searchKey {string} Key to search npm with
// #### @callback {function} The callback
//
npm.get = function (searchKey, callback) {
 
 
  //
  // Search NPM based on searchKey
  //
  
  
    //
    //  Send the results to the callback
    //
  
}

//
// ### function npm.install (hook, callback)
// #### @hook {string} name of Hook to install
// #### @callback {function} The callback
//
npm.install = function (hook, callback) {
  //
  //  Run the npm install command based on the incoming hook name
  //
  npmModule.load({exit:false}, function (err) {
    npmModule.install(hook, function (err, result) {
      callback(err, result);
    });
  });
}


//
// ### function npm.search (hook, callback)
// #### @hook {string} name of Hook to search for
// #### @callback {function} The callback
//
npm.search = function (keywords, callback) {
  npmModule.load({exit:false}, function (err) {
    npmModule.commands.search(keywords, function (err, result) {
      callback(err, result);
    });
  });
}
