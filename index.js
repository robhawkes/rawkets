var Hook = require("hook.io").Hook,
	RawketsClient = require("hook.io-rawkets-client").RawketsClient;

// Initialise hook server
var hook = new Hook( {
	name: "vanilla-hook",
	silent: true
});

hook.on("hook::ready", function() {
	// Spawn rawkets-client hook
	hook.spawn([{
		type: "rawkets-client",
		name: "rawkets-client",
		silent: false
	}]);
});

// Start hook server
hook.start();

// var rawkets = require("./server/index");
// rawkets.init();