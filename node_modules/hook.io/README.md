     __    __    ______     ______    __  ___         __    ______   
    |  |  |  |  /  __  \   /  __  \  |  |/  /        |  |  /  __  \  
    |  |__|  | |  |  |  | |  |  |  | |  '  /         |  | |  |  |  | 
    |   __   | |  |  |  | |  |  |  | |    <          |  | |  |  |  | 
    |  |  |  | |  `--'  | |  `--'  | |  .  \    __   |  | |  `--'  | 
    |__|  |__|  \______/   \______/  |__|\__\  (__)  |__|  \______/  

    a way to enable i/o for your node.js application
    
## hook.io is a distributed EventEmitter built on node.js. In addition to providing a minimalistic event framework, hook.io also provides a rich network of [hook libraries](https://github.com/hookio/hook.io/wiki/Hook.io-Libraries) for managing all sorts of input and output.

## "hooks" provide a very simple and light way to extend an application to seamlessly communicate with other "hook" enabled devices. By design, extending legacy applications to communicate with hook.io is *very* easy.

## hook.io applications are usually built by combining together several smaller "hooks" to compose new functionality in a distributed and organized way. 


## Features :

- Build large, decoupled, distributed, and fault tolerant I/O heavy applications in node.js
- Create hooks on ANY device that supports JavaScript (cross-browser support via [socket.io][1])
- Spawning and Daemonizing of processes handled with [Forever][4]
- Messaging API inherits and mimics Node's native EventEmitter API (with the help of EventEmitter2)
- Interprocess Message Publishing and Subscribing done through [EventEmitter2][2] and [dnode][3]
- Easily scale any tcp based messaging infrastructure (such as clustering socket.io chat rooms in memory) 
- Easily connect / disconnect hooks "hot" without affecting other services

## Additional Resources

 - Email List: [http://groups.google.com/group/hookio][0]
 - Video Lessons: [http://youtube.com/maraksquires](http://youtube.com/maraksquires) ( [mirror](https://github.com/hookio/tutorials) )
 - Wiki Pages [https://github.com/hookio/hook.io/wiki/_pages](https://github.com/hookio/hook.io/wiki/_pages) 
 - [hook.io for dummies](http://ejeklint.github.com/2011/09/23/hook.io-for-dummies-part-1-overview/)
 - [Distribute Node.js Apps with hook.io: ][6]
 - #nodejitsu on irc.freenode.net
 

# Installation

     [sudo] npm install hook.io -g
     
## Start a hook

    hookio
    
*auto-discovery will now create a hook server if this is your only running hook*

## Connect another hook

    hookio

*you now have two hooks connected to each other*

This is the most minimal hook.io application you can have. It does nothing. No cruft, no extra baggage.

## Connect another hook! With a REPL!

    hookio --repl

*you now have three hooks connected to each other*

## Extending your hook.io mesh

At this point, you've got 3 nodes talking to each other, and an interactive repl to run `hook.emit` and `hook.on` commands. Now you can extend your network of hooks using any of the existing hook libraries, or by extending from the base `Hook` object. You can now fire messages cross-process, cross-platform, and cross-browser.

# How about Unix Pipes?

## Pipe STDIN to hookio

    tail foo.txt -f | hookio 
    
**hook.io will now emit STDIN data as separate hook.io events**

    
## Pipe hook.io events to STDOUT

    hookio -p | less

Using the `-p` option, hook.io will stream events to STDOUT as `\n` delimited JSON documents. Each document represents a single hook.io event.

**example STDOUT:**

    {"name":"the-hook","event":"the-hook::sup","data":{"foo":"bar"}}

# Available Hooks (more coming soon)

Hook Library wiki: [https://github.com/hookio/hook.io/wiki/Hook.io-Libraries](https://github.com/hookio/hook.io/wiki/Hook.io-Libraries)

You can also search [http://search.npmjs.org/](http://search.npmjs.org/) for "hook.io" ( although there are so many matches already, the search interface can't display them all.. )

- [cron](http://github.com/hookio/cron): Adds and removes jobs that emit hook.io events on a schedule
- [couch](http://github.com/hookio/couch): Emit hook.io events based on your CouchDB _changes feed
- [irc](http://github.com/hookio/irc): Full IRC bindings
- [helloworld](http://github.com/hookio/helloworld)
- [logger](http://github.com/hookio/logger): Multi-transport Logger (Console, File, Redis, Mongo, Loggly)
- [hook.js](https://github.com/hookio/hook.js): Build web apps / use hook.io in any browser
- [mailer](http://github.com/hookio/mailer): Sends emails
- [sitemonitor](http://github.com/hookio/sitemonitor): A low level Hook for monitoring web-sites.
- [request](http://github.com/hookio/request): Simple wrapper for [http://github.com/mikeal/request](http://github.com/mikeal/request)
- [twilio](http://github.com/hookio/twilio): Make calls and send SMS through [Twilio][5]
- [twitter](http://github.com/hookio/twitter): Wrapper to Twitter API
- [webhook](http://github.com/hookio/webhook): Emits received HTTP requests as hook.io events (with optional JSON-RPC 1.0 Support)
- [wget](http://github.com/scottyapp/hook.io-wget): Downloads files using HTTP. Based on the http-get module by Stefan Rusu
- [tar](https://github.com/scottyapp/hook.io-tar): A hook to wrap around tar
- [gzbz2](https://github.com/scottyapp/hook.io-gzbz2): A hook for compressing and uncompressing files
- [mock](https://github.com/scottyapp/hook.io-mock): A hook that mocks messages. Useful for hook.io related development. 

## Using hook.io programmatically

**Note:** This is only one, small, example.

*see [examples](https://github.com/hookio/hook.io/tree/master/examples) folder for extensive example code*

*to see all other supported types of hook messaging ( including EventEmitter and Callback style ), see: [https://github.com/hookio/hook.io/tree/master/examples/messaging](https://github.com/hookio/hook.io/tree/master/examples/messaging)*

```js
var Hook = require('hook.io').Hook;

var hookA = new Hook({
  name: "a"
});

hookA.on('*::sup', function(data){
  // outputs b::sup::dog
  console.log(this.event + ' ' + data);
});

// Hook.start defaults to localhost
// it can accept dnode constructor options ( for remote connections )
// these hooks can be started on diffirent machines / networks / devices
hookA.start();

var hookB = new Hook({
  name: "b"
});

hookB.on('hook::ready', function(){
  hookB.emit('sup', 'dog');
});

hookB.start();
```
 
## Tests

All tests are written with [vows](http:://vowsjs.org) and require that you link hook.io to itself:

``` bash
  $ cd /path/to/hook.io
  $ [sudo] npm link
  $ [sudo] npm link hook.io
  $ npm test
```


## Core Contributors ( https://github.com/hookio/hook.io/contributors )

  - Marak (Marak Squires)
  - indexzero (Charlie Robbins)
  - jesusabdullah (Joshua Holbrook)
  - temsa (Florian Traverse)
  - mmalecki (Maciej Małecki)
  - jamesonjlee (Jameson)
  - pksunkara (Pavan Kumar Sunkara)
  - Marsup (Nicolas Morel)
  - mklabs (Mickael Daniel)
  - Tim-Smart (Tim)
  - stolsma (Sander Tolsma)
  - sergeyksv
  - thejh (Jann Horn)
  - booyaa (Mark Sta Ana)
  - perezd (Derek Perez)
  - ejeklint (Per Ejeklint)
  - emilisto
  - vns
  - mwawrusch (Martin Wawrusch)
  - AvianFlu (Charlie McConnell)

## MIT License

Copyright (c) Nodejitsu

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[0]: http://groups.google.com/group/hookio
[1]: http://socket.io
[2]: https://github.com/hij1nx/EventEmitter2
[3]: http://github.com/SubStack/dnode
[4]: https://github.com/indexzero/forever
[5]: http://www.twilio.com/
[6]: http://blog.nodejitsu.com/distribute-nodejs-apps-with-hookio