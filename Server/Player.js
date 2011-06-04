/**************************************************
** PLAYER ENTITY
**************************************************/

var State = require("./State"),
	Input = require("./Input");

var Player = function(id, x, y, vx, vy, f, a) {
	var id = id,
		currentState = State.init(x, y, vx, vy, f, a),
		previousState = State.init(currentState.p.x, currentState.p.y, currentState.v.x, currentState.v.y, currentState.f, currentState.a),
		currentInput = Input.init(),
		previousInput = Input.init(),
		MAX_VELOCITY = 25,
		rotationSpeed = 0.09; // Manually set rotation speed for now

	var getState = function(snapped) {
		var newState;
		if (snapped) {
			newState = State.init(Math.floor(currentState.p.x), Math.floor(currentState.p.y), Math.floor(currentState.v.x), Math.floor(currentState.v.y), Math.floor(currentState.f), currentState.a);
			return newState;
		};

		newState = State.init(currentState.p.x, currentState.p.y, currentState.v.x, currentState.v.y, currentState.f, currentState.a);
		return newState;
	};

	var getInput = function() {
		var newInput = Input.init(currentInput.forward, currentInput.rotation);
		return newInput;
	};
	
	var getPreviousInput = function() {
		return previousInput;
	};
	
	var setState = function(state) {
		currentState.p.x = state.p.x;
		currentState.p.y = state.p.y;
		currentState.v.x = state.v.x;
		currentState.v.y = state.v.y;
		currentState.f = state.f;
		currentState.a = state.a;
	};

	var updateState = function() {
		previousState = State.init(currentState.p.x, currentState.p.y, currentState.v.x, currentState.v.y, currentState.f, currentState.a);

		if (!currentInput) {
			return;
		};
		
		currentState.a += (currentInput.rotation > 0) ? rotationSpeed : (currentInput.rotation < 0) ? -rotationSpeed : 0;

		// Is it a good idea to update the force here, rather than in the physics update?
		//if (!previousInput || currentInput.forward != previousInput.forward) {
		//currentState.f = (currentInput.forward > 0) ? 10 : (Math.abs(currentState.v.x) > 0.1 || Math.abs(currentState.v.y) > 0.1) ? -5 : 0;
		currentState.f = (currentInput.forward > 0) ? 25 : 0;
		//};
		
		currentState.v.x *= 0.96;
		currentState.v.y *= 0.96;
		
		// This velocity check should be within the integration somewhere
		if (currentState.v.x > MAX_VELOCITY) {
			currentState.v.x = MAX_VELOCITY;
		} else if (Math.abs(currentState.v.x) < 0.01) {
			currentState.v.x = 0;
		};
		
		if (currentState.v.y > MAX_VELOCITY) {
			currentState.v.y = MAX_VELOCITY;
		} else if (Math.abs(currentState.v.y) < 0.01) {
			currentState.v.y = 0;
		};
	};

	var updateInput = function(newInput) {
		previousInput = currentInput;
		currentInput = newInput;
	};

	return {
		id: id,
		currentState: currentState,
		getState: getState,
		getInput: getInput,
		getPreviousInput: getPreviousInput,
		setState: setState,
		updateState: updateState,
		updateInput: updateInput
	};
};

exports.init = function(id, x, y, v, f, a) {
	return new Player(id, x, y, v, f, a);
};