/**************************************************
** KEYBOARD OBJECT
**************************************************/

r.namespace("Keyboard");
rawkets.Keyboard = function() {
	// Properties
	var keys = {
		fire: false,
		up: false,
		left: false,
		right: false
	};
		
	var onKeyDown = function(e) {
		var self = this,
			c = e.keyCode;
		switch (c) {
			// Controls
			case 32: // Fire
				self.keys.fire = true;
				break;
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
			case 32: // Fire
				self.keys.fire = false;
				break;
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