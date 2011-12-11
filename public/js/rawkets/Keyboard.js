/**************************************************
** KEYBOARD OBJECT
**************************************************/

r.namespace("Keyboard");
rawkets.Keyboard = function() {
	// Properties
	var keys = {
		up: false,
		left: false,
		right: false
	};
		
	var onKeyDown = function(e) {
		var self = this,
			c = e.keyCode;
		switch (c) {
			// Controls
			case 37: // Left
				self.keys.left = true;
				break;
			case 38: // Up
				self.keys.up = true;
				break;
			case 39: // Right
				self.keys.right = true;
				break;
		}
	};
	
	var onKeyUp = function(e) {
		var self = this,
			c = e.keyCode;
		switch (c) {
			case 37: // Left
				self.keys.left = false;
				break;
			case 38: // Up
				self.keys.up = false;
				break;
			case 39: // Right
				self.keys.right = false;
				break;
		}
	};

	return {
		keys: keys,
		onKeyDown: onKeyDown,
		onKeyUp: onKeyUp
	};
};