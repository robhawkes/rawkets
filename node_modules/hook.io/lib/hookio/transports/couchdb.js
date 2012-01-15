//
// couchdb.js - the couchdb message transport for hook.io
//

var couch = exports,
    http  = require('http');

couch.message = function (options, event, data, callback) {
  
  var req, 
      options;

  options = {
    host: options.host || '127.0.0.1',
    port: options.port || 5984,
    path: "/" + options.db || 'database',
    method: "POST",
    headers: {"content-type": "application/json"}
  };
  
  if (options.user && options.pass) {
    options.headers["Authorization"] = "Basic " + new Buffer(options.user + ":" + options.pass).toString('base64');
  }
  
  req = http.request(options, function (res) { 
    //
    // TODO:
    //
  }); 

  req.on('error', function (err) {
    //
    // TODO:
    //
  });
  
  req.write(JSON.stringify({ 
    method: event, 
    params: data
  }));
  
  req.end();
  
};