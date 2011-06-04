/**************************************************
** PLAYER ENTITY
**************************************************/

r.namespace("Player");
rawkets.Player = function(id, x, y, vx, vy, f, a) { // Should probably just use a State object, instead of 6 arguments
	var id = id,
		currentState = new r.State(x, y, vx, vy, f, a),
		previousState = new r.State(currentState.p.x, currentState.p.y, currentState.v.x, currentState.v.y, currentState.f, currentState.a),
		currentInput = new r.Input(),
		previousInput = new r.Input(),
		MAX_VELOCITY = 25,
		rotationSpeed = 0.09, // Manually set rotation speed for now
		//MAX_ROTATION_SPEED = 0.09, // Maximum rotation speed
		lastCorrection; // Time of last correction received from server
		
	var getState = function(snapped) {
		var newState;
		if (snapped) {
			newState = new r.State(Math.floor(currentState.p.x), Math.floor(currentState.p.y), Math.floor(currentState.v.x), Math.floor(currentState.v.y), Math.floor(currentState.f), currentState.a);
			return newState;
		};
		
		newState = new r.State(currentState.p.x, currentState.p.y, currentState.v.x, currentState.v.y, currentState.f, currentState.a);
		return newState;
	};

	var getInput = function() {
		var newInput = new r.Input(currentInput.forward, currentInput.rotation);
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
		
	var updateState = function(time) {
		// Halt entity if there isn't a recent correction
		if (time && lastCorrection && time - lastCorrection > 500) {
			currentState = new r.State();
			previousState = new r.State();
			return;
		};
		
		previousState = new r.State(currentState.p.x, currentState.p.y, currentState.v.x, currentState.v.y, currentState.f, currentState.a);
		
		if (!currentInput) {
			return;
		};
		
		// Removed for time being to keep things simple
		/*if (Math.abs(currentInput.rotation) > 0) {
			rotationSpeed += 0.01;
			if (rotationSpeed > MAX_ROTATION_SPEED) {
				rotationSpeed = MAX_ROTATION_SPEED;
			};
		};*/
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
	
	// Client-side interpolation
	var correctState = function(time, state) {
		var positionDelta = state.p.x - currentState.p.x;
		if (Math.abs(positionDelta) > 5) {
			currentState.p.x = state.p.x;
		} else if (Math.abs(positionDelta) > 0.5) {
			currentState.p.x += state.p.x * 0.1;
		};
		
		currentState.v.x = state.v.x;
		currentState.v.y = state.v.y;
		currentState.f = state.f;
		currentState.a = state.a;
		
		lastCorrection = time;
	};
	
	return {
		id: id,
		currentState: currentState,
		getState: getState,
		getInput: getInput,
		getPreviousInput: getPreviousInput,
		setState: setState,
		updateState: updateState,
		updateInput: updateInput,
		correctState: correctState
	};
};