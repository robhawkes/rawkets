var Hook = require("hook.io").Hook,
	Rawkets = require("hook.io-rawkets").Rawkets;

// Initialise hook server
var hook = new Hook( {
	name: "vanilla-hook",
	silent: 1
});

hook.on("hook::ready", function() {
	// Spawn rawkets hook
	hook.spawn([{
		type: "rawkets",
		name: "rawkets",
		silent: 1
	}]);
});

// Start hook server
hook.start();