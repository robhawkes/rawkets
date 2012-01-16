var scaffold = {};

var fs = require('fs'),
    async = require('async'),
    mkdirp = require('mkdirp'),
    colors = require('colors'),
    path = require('path');

scaffold.files = ['config.json', 'LICENSE', 'package.json', 'ReadMe.md', 'bin/scaffold', 'lib/scaffold.js'];

scaffold.generate = function (hookName, hookPath, callback) {
  
  var self = this;
  
  function copyFiles (file, callback) {

    var self = this,
        src  = __dirname + '/scaffold/',
        dst  = hookPath;

    console.log(hookName, hookPath);

    fs.readFile(src + file, function(err, result){
      if (err) {
        return console.log(err);
      }
      //
      // TODO: scan for word scaffold and replace
      //
      var filePath = path.normalize(dst + file);
      // Replace the `scaffold` file name with the new hook name
      //

      filePath = filePath.replace('lib/scaffold.js', 'lib/' + hookName + '.js');
      filePath = filePath.replace('bin/scaffold', 'bin/' + hookName);

      //
      // Replace any instances of the string 'scaffold' or 'Scaffold',
      // with new hook name
      //
      console.log(filePath);
      result = result.toString().replace(/scaffold/g, hookName);

      var className = hookName.substr(0, 1).toUpperCase() + hookName.substr(1, hookName.length);

      result = result.toString().replace(/Scaffold/g, className);

      (function(filePath) {
          mkdirp(path.dirname(filePath), 0755, function(err){
            if(err){
              console.log(err);
              callback(err);
            }
            fs.writeFile(filePath, result, function(err, result){
              callback(err, result);
            });
          });
      })(filePath);
    });
  }
  
  async.map(scaffold.files, copyFiles, function(err, results){
    if (err) {
      return console.log(err);
    }
    console.log('Hook scaffold for ' + hookName.cyan  + ' generated in '
      + hookPath.grey + '');
    if(callback) {
      callback(null);
    }
  });
};


module['exports'] = scaffold.generate;