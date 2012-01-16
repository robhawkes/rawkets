//
// list - Shows all currently installed and running hooks
//

//
// TODO: command system should be refactored to use Flatiron
//


var path     = require('path'),
    prompt   = require('prompt');


var list = module.exports = function init () {

  //
  // Deletgate based on incoming argv
  //
  var self = this,
      args = self._,
      newHookName,
      newHookPath = process.cwd() + '/';

  //
  // $ list
  //
  if(args.length === 1) {

  }

  self.emit('query', { type: 'hook' }, function(err, result){
  console.log('Attempting to query for all locally running hooks...');
    if (err) {
      console.log('error running query');
    }
    console.log(result);
    process.nextTick(function(){
      process.exit();
    });
  });

}
