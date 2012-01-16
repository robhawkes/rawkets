//
// search - Performs a search of hooks to install ( using npm.search in the background )
//

//
// TODO: command system should be refactored to use Flatiron
//


var path     = require('path'),
    prompt   = require('prompt');


var search = module.exports = function init () {

  //
  // Deletgate based on incoming argv
  //
  var self = this,
      args = self._,
      keywords = ["hook.io"];



  //
  // $ search
  //
  if(args.length === 1) {
  }

  //
  // $ search foobar
  //
  if(args.length === 2) {
    keywords.push(args[1]);
  }

  console.log('Searching npm for ' + keywords + ', this may take a moment...');
  self.npm.search(keywords, function(err, result){

    if(err){
      console.log(err);
    }

    process.nextTick(function(){
      process.exit();
    });

  });

}
