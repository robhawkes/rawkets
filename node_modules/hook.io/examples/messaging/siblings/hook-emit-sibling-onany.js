var	Hook = require('../../../lib/hookio').Hook;

var parent = new Hook({
  name: 'parent',
});

var sender = new Hook({
  name: 'sender',
});

var receiver = new Hook({
  name: 'receiver',
});

parent.on("hook::ready", function () {
  console.log("parent hook ready.");
  sender.start();

  sender.on("hook::ready", function () {
    console.log("sending hook ready.");
    receiver.start();

    receiver.on("hook::ready", function () {
      console.log("receiver hook ready.");

      // This example breaks unless this section is un-commented.
      //receiver.on("*::ping", function (data) {
      //  console.log("*::ping", this.event);
      //});

      receiver.onAny(function (data) {
        console.log(this.event, data);
      });

      //emit from sender
      setInterval(function () {
        sender.emit('ping', { "foo": "bar" });
      }, 500);
    });
  });
});

parent.start();
