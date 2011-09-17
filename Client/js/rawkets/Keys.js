/**************************************************
** KEYS OBJECT
**************************************************/

r.namespace("Keys");
rawkets.Keys = function(up, left, right) {
	// Properties
	var up = up || false,
		left = left || false,
		right = right || false;
		
	var onKeyDown = function(e) {
		var that = this,
			c = e.keyCode;
		switch (c) {
			// Controls
			case 37: // Left
				that.left = true;
				break;
			case 38: // Up
				that.up = true;
				break;
			case 39: // Right
				that.right = true; // Will take priority over the left key
				break;
		};
	};
	
	var onKeyUp = function(e) {
		var that = this,
			c = e.keyCode;
		switch (c) {
			case 37: // Left
				that.left = false;
				break;
			case 38: // Up
				that.up = false;
				break;
			case 39: // Right
				that.right = false;
				break;
			case 80: // p
				r.Event.fire("PROFILER_OUTPUT");
				break;
		};
	};

	return {
		up: up,
		left: left,
		right: right,
		onKeyDown: onKeyDown,
		onKeyUp: onKeyUp
	};
};