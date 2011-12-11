describe("Controls", function() {
	var controls;

	// Gamepad
	describe("Gamepad", function() {
		var gamepad,
			fakeDevice,
			playerAngle;

		beforeEach(function() {
			controls = new r.Controls();

			fakeDevice = {
				connected: true,
				id: "45e-28e-Wireless 360 Controller",
				axes: {
					Left_Stick_X: 0,
					Left_Stick_Y: 0
				},
				buttons: {
					A_Button: 0
				}
			};

			playerAngle = 0;
			gamepad = controls.addGamepad(fakeDevice);
		});

		it("Should return gamepad object on initialisation and by request", function() {
			assert(gamepad && gamepad.id);

			var tmpGamepad = controls.getGamepad();
			assert(tmpGamepad && tmpGamepad.id);
		});

		it("Should return false if gamepad is in use and player angle is not provided or isn't a number", function() {
			var input;

			gamepad.axes.Left_Stick_X = 1;
			input = controls.updateInput();

			assert(input === false);

			playerAngle = "Not a number";
			input = controls.updateInput(playerAngle);

			assert(input === false);
		});

		it("Should trigger forward input if left stick has moved enough", function() {
			var input;

			gamepad.axes.Left_Stick_X = 1;

			input = controls.updateInput(playerAngle);

			assert(input.forward === 1);

			gamepad.axes.Left_Stick_X = 0;
			gamepad.axes.Left_Stick_Y = 1;

			input = controls.updateInput(playerAngle);
			assert(input.forward === 1);
		});

		it("Should't trigger forward input if left stick hasn't moved enough", function() {
			var input;

			gamepad.axes.Left_Stick_X = 0.1;

			input = controls.updateInput(playerAngle);

			assert(input.forward === 0);

			gamepad.axes.Left_Stick_X = 0;
			gamepad.axes.Left_Stick_Y = 0.1;

			input = controls.updateInput(playerAngle);
			assert(input.forward === 0);
		});

		it("Should trigger rotation when left stick angle is far enough from player angle", function() {
			var input;

			// 315 degrees (top right)
			gamepad.axes.Left_Stick_X = 1;
			gamepad.axes.Left_Stick_Y = -1;

			// 90 degrees (bottom centre)
			playerAngle = Math.PI/2;
			input = controls.updateInput(playerAngle);

			assert(input.rotation === -1);

			// 135 degrees (bottom left)
			gamepad.axes.Left_Stick_X = -1;
			gamepad.axes.Left_Stick_Y = 1;

			input = controls.updateInput(playerAngle);

			assert(input.rotation === 1);
		});

		it("Shouldn't trigger rotation when left stick angle is too close to player angle", function() {
			var input;

			// 90 degrees (bottom centre)
			gamepad.axes.Left_Stick_X = 0;
			gamepad.axes.Left_Stick_Y = 1;

			// 90 degrees (bottom centre)
			playerAngle = Math.PI/2;
			input = controls.updateInput(playerAngle);

			assert(input.rotation === 0);

			// 0 degrees (centre right)
			gamepad.axes.Left_Stick_X = 1;
			gamepad.axes.Left_Stick_Y = 0;

			// 5 degrees
			playerAngle = 5 * Math.PI/180;
			input = controls.updateInput(playerAngle);

			assert(input.rotation === 0);

			// 355 degrees
			playerAngle = 355 * Math.PI/180;
			input = controls.updateInput(playerAngle);

			assert(input.rotation === 0);
		});

		it("Should trigger weapon activation when 'A' button is depressed", function() {
			var input;

			gamepad.buttons.A_Button = 1;
			input = controls.updateInput(playerAngle);

			assert(input.fire === 1);
		});

		it("Shouldn't trigger weapon activation when 'A' button is not depressed", function() {
			var input;

			gamepad.buttons.A_Button = 0;
			input = controls.updateInput(playerAngle);

			assert(input.fire === 0);
		});
	});

	// Keyboard
	describe("Keyboard", function() {
		var player,
			keyboard,
			fakeKeyboardEvent;

		beforeEach(function() {
			controls = new r.Controls();

			player = {
				currentState: {a: 0}
			};

			keyboard = controls.addKeyboard(new r.Keyboard());

			fakeKeyboardEvent = {
				keyCode: null
			};
		});

		it("Should return keyboard object on initialisation and by request", function() {
			assert(keyboard && keyboard.keys);

			var tmpKeyboard = controls.getKeyboard();
			assert(tmpKeyboard && tmpKeyboard.keys);
		});

		it("Should trigger forward input when up arrow is depressed", function() {
			var input;

			fakeKeyboardEvent.keyCode = 38;
			keyboard.onKeyDown(fakeKeyboardEvent);

			input = controls.updateInput();

			assert(input.forward === 1);
		});

		it("Should't trigger forward input when up arrow is not depressed", function() {
			var input;

			// Keycode that isn't the up arrow
			fakeKeyboardEvent.keyCode = 7;
			keyboard.onKeyDown(fakeKeyboardEvent);

			input = controls.updateInput();

			assert(input.forward === 0);

			// Press and release forward input
			fakeKeyboardEvent.keyCode = 38;
			keyboard.onKeyDown(fakeKeyboardEvent);
			keyboard.onKeyUp(fakeKeyboardEvent);

			input = controls.updateInput();

			assert(input.forward === 0);
		});

		it("Should trigger rotation input when up left or right arrow is depressed", function() {
			var input;
			
			// Left arrow
			fakeKeyboardEvent.keyCode = 37;
			keyboard.onKeyDown(fakeKeyboardEvent);

			input = controls.updateInput();

			assert(input.rotation === -1);

			// Right arrow
			fakeKeyboardEvent.keyCode = 39;
			keyboard.onKeyDown(fakeKeyboardEvent);

			input = controls.updateInput();

			assert(input.rotation === 1);
		});

		it("Should't trigger rotation input when left or right arrow is not depressed", function() {
			var input;

			// Keycode that isn't the left or right arrow
			fakeKeyboardEvent.keyCode = 38;
			keyboard.onKeyDown(fakeKeyboardEvent);

			input = controls.updateInput();

			assert(input.rotation === 0);

			// Press and release left input
			fakeKeyboardEvent.keyCode = 37;
			keyboard.onKeyDown(fakeKeyboardEvent);
			keyboard.onKeyUp(fakeKeyboardEvent);

			input = controls.updateInput();

			assert(input.rotation === 0);

			// Press and release right input
			fakeKeyboardEvent.keyCode = 39;
			keyboard.onKeyDown(fakeKeyboardEvent);
			keyboard.onKeyUp(fakeKeyboardEvent);

			input = controls.updateInput();

			assert(input.rotation === 0);
		});

		it("Should trigger weapon activation when spacebar is depressed", function() {
			var input;

			// Spacebar
			fakeKeyboardEvent.keyCode = 32;
			keyboard.onKeyDown(fakeKeyboardEvent);

			input = controls.updateInput();

			assert(input.fire === 1);
		});

		it("Shouldn't trigger weapon activation when spacebar is not depressed", function() {
			var input;

			// Not spacebar
			fakeKeyboardEvent.keyCode = 24;
			keyboard.onKeyDown(fakeKeyboardEvent);

			input = controls.updateInput();

			assert(input.fire === 0);

			// Press and release spacebar
			fakeKeyboardEvent.keyCode = 32;
			keyboard.onKeyDown(fakeKeyboardEvent);
			keyboard.onKeyUp(fakeKeyboardEvent);

			input = controls.updateInput();

			assert(input.rotation === 0);
		});
	});

	// Mouse
});