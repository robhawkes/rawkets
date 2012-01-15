/**************************************************
** BULLET ENTITY
**************************************************/

var State = require("./State");

var Bullet = function(id, playerId, x, y, a) {
	var id = id,
		playerId = playerId,
		born = Date.now(),
		currentState = State.init(x, y, a, 0, 100, Math.cos(a)*900, Math.sin(a)*900), // Manual velocity = messy
		previousState = State.init(currentState.p.x, currentState.p.y, currentState.a, currentState.f, currentState.h, currentState.v.x, currentState.v.y);

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
		
		// currentState.a += (currentInput.rotation > 0) ? rotationSpeed : (currentInput.rotation < 0) ? -rotationSpeed : 0;
		// // Normalise the angle
		// if (currentState.a > Math.PI*2) {
		// 	currentState.a = currentState.a - Math.PI*2;
		// } else if (currentState.a < -Math.PI*2) {
		// 	currentState.a = currentState.a + Math.PI*2;
		// };

		// Is not having a maximum velocity going to cause problems?
		//currentState.f = 2000;
		
		// This velocity check should be within the integration somewhere
		// if (Math.abs(currentState.v.x) > MAX_VELOCITY) {
		// 	if (currentState.v.x > 0) {
		// 		currentState.v.x = MAX_VELOCITY;
		// 	} else {
		// 		currentState.v.x = -MAX_VELOCITY;
		// 	};
		// };
		
		// if (Math.abs(currentState.v.y) > MAX_VELOCITY) {
		// 	if (currentState.v.y > 0) {
		// 		currentState.v.y = MAX_VELOCITY;
		// 	} else {
		// 		currentState.v.y = -MAX_VELOCITY;
		// 	};
		// };
		
		//console.log("c:"+currentState.v.x);
	};

	return {
		id: id,
		playerId: playerId,
		born: born,
		currentState: currentState,
		getState: getState,
		setState: setState,
		updateState: updateState
	};
};

exports.init = function(id, playerId, x, y, a) {
	return new Bullet(id, playerId, x, y, a);
};