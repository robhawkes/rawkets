var hookio = require('./hook'),
    async  = require('async'),
    path   = require('path');

exports.query = function (params, callback) {

  //
  // Performs a query on the hook to get details about other hooks.
  // takes an object as first parameter, which should look like:
  //   {name:'name-of-the-targetted-hook'}
  // or
  //   {type:'type-of-the-targetted-hook'}
  // or
  //   {host:'hostname-hosting-some-hook-or-its-IP'}
  //
  // the result can be received either as:
  // - a callback(error, details) if callback is provided as a standard callback
  //
  //    * error parameter will be returned if result is empty
  //    * details will be a String (or undefined) if we have queried by name
  //
  // - a query::out({query: originalQuery, details: arrayOfDetails}) event
  //   if callback is not defined.
  //
  //    * details is then always an Array of details, and if nothing is available
  //        for the passed query, Array is just empty.
  //    * query contains the original query, in order for your hook to check
  //        it's one similar to what it was looking for, or not.
  //
  // Each details provided is of the form :
  // {
  //   name: 'hook-name',
  //   type:'hook-type',
  //   remote:{ host:'ip address', port:99999/*port number*/}
  // }
  //

  var self = this;

  params = params || {};
  var name = params.name,
      type = params.type,
      host = params.host;

  if (!self.server) {
    return;
  }

  if (typeof callback !== "function") {
    callback = function (err, details) {
      if (!Array.isArray(details)) {
        details = [details];
      }
      return self.emit("query::out", {query: params, details: details})};
  }
  if (name) {
    if (self._names[name]) {
      //console.log(callback);
      callback(null, self._names[name]);
    }
    else {
      callback(new Error("No hook named "+name+" is connected (anymore?)"));
    }
  } else if (type) {
    var details = Object.keys(self._names)
      .map(function (key) { if (self._names[key].type === type) return self._names[key]; })
      .filter(function (detail) {return detail});

    if (details.length>0) {
      callback(null, details);
    } else {
      callback(new Error("No hook of type "+type+" is connected (anymore?)"),[]);
    }

  } else if (host) {
      self.toIPs(host, function onIP(err, hosts) {
        var details = Object.keys(self._names).map(function getHooks(key) {
          if ( hosts.some( function hasHost (host) {return host === self._names[key].remote.host} ) )
            return self._names[key];
        }).filter(function (detail) {return detail});

        if (details.length>0)
          callback(null, details);
        else
          callback(new Error("No hook for host "+host+" is connected (anymore?)"),[]);
      });
  }

};