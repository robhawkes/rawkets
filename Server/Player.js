/**************************************************
** PLAYER ENTITY
**************************************************/

var State = require("./State"),
	Input = require("./Input");

var Player = function(id, x, y, a, f, vx, vy) {
	var id = id,
		currentState = State.init(x, y, a, f, vx, vy),
		previousState = State.init(currentState.p.x, currentState.p.y, currentState.a, currentState.f, currentState.v.x, currentState.v.y),
		currentInput = Input.init(),
		previousInput = Input.init(),
		MAX_VELOCITY = 1500,
		rotationSpeed = 0.09; // Manually set rotation speed for now

	var getState = function(trim) {
		var newState;
		if (trim) {
			// Full state for client prediction
			// newState = State.init(Math.floor(currentState.p.x), Math.floor(currentState.p.y), currentState.a, Math.floor(currentState.f), Math.floor(currentState.v.x), Math.floor(currentState.v.y));
			// Slim state
			newState = State.init(Number(currentState.p.x.toFixed(2)), Number(currentState.p.y.toFixed(2)), Number(currentState.a.toFixed(2)), currentState.f);
			return newState;
		};

		// Full state for client prediction
		// newState = State.init(currentState.p.x, currentState.p.y, currentState.a, currentState.f, currentState.v.x, currentState.v.y);
		// Slim state
		newState = State.init(currentState.p.x, currentState.p.y, currentState.a, currentState.f);
		return newState;
	};

	var getInput = function() {
		var newInput = Input.init(currentInput.forward, currentInput.rotation);
		return newInput;
	};
	
	var getPreviousInput = function() {
		return previousInput;
	};

	var hasChanged = function() {
		if (JSON.stringify(currentState) != JSON.stringify(previousState)) {
			return true;
		};

		return false;
	};
	
	var setState = function(state) {
		currentState.p.x = state.p.x;
		currentState.p.y = state.p.y;

		if (state.v) {
			currentState.v.x = state.v.x;
			currentState.v.y = state.v.y;
		};

		if (state.f) {
			currentState.f = state.f;	
		};
		
		currentState.a = state.a;
	};

	var updateState = function() {
		//console.log("p:"+previousState.v.x);
		previousState = State.init(currentState.p.x, currentState.p.y, currentState.a, currentState.f, currentState.v.x, currentState.v.y);

		if (!currentInput) {
			return;
		};
		
		currentState.a += (currentInput.rotation > 0) ? rotationSpeed : (currentInput.rotation < 0) ? -rotationSpeed : 0;
		// Normalise the angle
		if (currentState.a > Math.PI*2) {
			currentState.a = currentState.a - Math.PI*2;
		} else if (currentState.a < -Math.PI*2) {
			currentState.a = currentState.a + Math.PI*2;
		};

		// Is it a good idea to update the force here, rather than in the physics update?
		//if (!previousInput || currentInput.forward != previousInput.forward) {
		//currentState.f = (currentInput.forward > 0) ? 10 : (Math.abs(currentState.v.x) > 0.1 || Math.abs(currentState.v.y) > 0.1) ? -5 : 0;
		currentState.f = (currentInput.forward > 0) ? 250 : 0;
		//};
		
		// Multiplying velocity by fraction causes sync issues between client and server
		// Need to come up with a more reliable method.
		currentState.v.x *= 0.98;
		currentState.v.y *= 0.98;
		
		// Reducing velocity by a fixed amount to help with syncing
		if (Math.abs(currentState.v.x) > 0.5) {
			//currentState.v.x -= (currentState.v.x > 0) ? 0.5 : -0.5;
		};
		
		if (Math.abs(currentState.v.y) > 0.5) {
			//currentState.v.y -= (currentState.v.y > 0) ? 0.5 : -0.5;
		};
		
		// This velocity check should be within the integration somewhere
		if (Math.abs(currentState.v.x) > MAX_VELOCITY) {
			if (currentState.v.x > 0) {
				currentState.v.x = MAX_VELOCITY;
			} else {
				currentState.v.x = -MAX_VELOCITY;
			};
		} else if (previousState.v.x != 0 && Math.abs(currentState.v.x) < 0.6) {
			currentState.v.x = 0;
		};
		
		if (Math.abs(currentState.v.y) > MAX_VELOCITY) {
			if (currentState.v.y > 0) {
				currentState.v.y = MAX_VELOCITY;
			} else {
				currentState.v.y = -MAX_VELOCITY;
			};
		} else if (previousState.v.y != 0 && Math.abs(currentState.v.y) < 0.6) {
			currentState.v.y = 0;
		};
		
		//console.log("c:"+currentState.v.x);
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
		hasChanged: hasChanged,
		setState: setState,
		updateState: updateState,
		updateInput: updateInput
	};
};

exports.init = function(id, x, y, a, f, vx, vy) {
	return new Player(id, x, y, a, f, vx, vy);
};