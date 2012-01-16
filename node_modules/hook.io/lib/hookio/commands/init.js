//
// init - Creates new hook.io hook scaffolds
//
var path     = require('path'),
    prompt   = require('prompt');


//
// TODO: command system should be refactored to use Flatiron
//


var init = module.exports = function init () {

  //
  // Deletgate based on incoming argv
  //
  var self = this,
      args = self._,
      newHookName,
      newHookPath = process.cwd() + '/';

  //
  // $ init
  //
  if(args.length === 1) {
    
  }
  
  //
  // $ init ./path/to/new/hook
  //
  if(args.length >= 2 && args[1].search(/\.|\//) !== -1) {
    newHookPath = path.normalize(newHookPath + '/' + args[1] + '/');
  }

  //
  // $ init newhookname
  //
  if(args.length >= 2 && args[1].search(/\.|\//) === -1) {
    newHookName = args[1];
  }

  prompt.start();
  console.log('Welcome to the ' + 'hook.io'.magenta + ' scaffold tool!');
  console.log('This will attempt to generate a new hook at: ' + newHookPath.grey);
  if (!newHookName) {
    prompt.get([{
      name: 'hookname',
      message: 'Name your hook'
    }], function (err, result) {
      if (err) {
        throw err;
      }
      newHookName = result['hookname'];
      self.scaffold(newHookName, newHookPath, process.exit);
    });
    
  } else {
    self.scaffold(newHookName, newHookPath, process.exit);
  }

}

init.usage = 'Print out a <msg>';