/**************************************************
** CONTROLS
**************************************************/

r.namespace("Controls");
rawkets.Controls = function() {
	// Properties
	var gamepad,
		keyboard,
		mouse;

	// Gamepad
	var addGamepad = function(device) {
		if (!device) {
			return false;
		}

		gamepad = device;
		return gamepad;
	};

	var getGamepad = function() {
		return gamepad;
	};

	// Keyboard
	var addKeyboard = function(device) {
		if (!device) {
			return false;
		}

		keyboard = device;
		return keyboard;
	};

	var getKeyboard = function() {
		return keyboard;
	};

	// Priority: gamepad, keyboard, mouse
	var updateInput = function(playerAngle) {
		var input = new r.Input();

		// Gamepad
		if (gamepad) {
			if (Math.abs(gamepad.axes.Left_Stick_X) > 0.2 || Math.abs(gamepad.axes.Left_Stick_Y) > 0.2) {
				if (playerAngle === undefined || isNaN(parseFloat(playerAngle))) {
					return false;
				}

				input.forward = 1;

				var relativeDiff = {};
				relativeDiff.x = (gamepad.axes.Left_Stick_X*100) * Math.cos(playerAngle) + (gamepad.axes.Left_Stick_Y*100) * Math.sin(playerAngle);
				relativeDiff.y = (gamepad.axes.Left_Stick_Y*100) * Math.cos(playerAngle) - (gamepad.axes.Left_Stick_X*100) * Math.sin(playerAngle);

				var relativeAngle = Math.atan2(relativeDiff.y, relativeDiff.x);
				if (relativeAngle > 0.1 && relativeAngle < Math.PI) {
					input.rotation = 1;
				} else if (relativeAngle < -0.1 && relativeAngle > -Math.PI) {
					input.rotation = -1;
				}

				return input;
			}
		}

		// Keyboard
		if (keyboard) {
			var keys = keyboard.keys;

			if (keys.up === true) {
				input.forward = 1;
			}

			if (keys.left === true) {
				input.rotation = -1;
			}

			// Right takes priority if both keys are depressed
			if (keys.right === true) {
				input.rotation = 1;
			}

			return input;
		}

		// If all else fails, return the standard input
		return input;
	};

	return {
		addGamepad: addGamepad,
		getGamepad: getGamepad,
		addKeyboard: addKeyboard,
		getKeyboard: getKeyboard,
		updateInput: updateInput
	};
};