/**************************************************
** BULLET ENTITY
**************************************************/

// Dumb and super-simple for now

r.namespace("Bullet");
rawkets.Bullet = function(id, x, y, a, f, vx, vy) { // Should probably just use a State object, instead of 6 arguments
	var id = id,
		currentState = new r.State(x, y, a, f),
		previousState = new r.State(currentState.p.x, currentState.p.y, currentState.a, currentState.f);
		
	var getState = function(trim) {
		var newState;
		if (trim) {
			// Full state for client prediction
			// newState = r.State(Math.floor(currentState.p.x), Math.floor(currentState.p.y), currentState.a, Math.floor(currentState.f), Math.floor(currentState.v.x), Math.floor(currentState.v.y));
			// Slim state
			newState = r.State(Number(currentState.p.x.toFixed(2)), Number(currentState.p.y.toFixed(2)), Number(currentState.a.toFixed(2)), currentState.f);
			return newState;
		};

		// Full state for client prediction
		// newState = r.State(currentState.p.x, currentState.p.y, currentState.a, currentState.f, currentState.v.x, currentState.v.y);
		// Slim state
		newState = r.State(currentState.p.x, currentState.p.y, currentState.a, currentState.f);
		return newState;
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

		if (state.f >= 0) {
			currentState.f = state.f;	
		};
		
		currentState.a = state.a;
	};

	var updateState = function() {
		previousState = r.State(currentState.p.x, currentState.p.y, currentState.a, currentState.f, currentState.v.x, currentState.v.y);
	};
	
	var draw = function(viewport) {
		if (currentState) {
			var ctx = viewport.ctx;
			var screenPos = viewport.worldToScreen(currentState.p.x, currentState.p.y);

			// Bullet is within the viewport
			if (viewport.withinBounds(currentState.p.x, currentState.p.y)) {
				ctx.save();
				ctx.translate(screenPos.x, screenPos.y);
				ctx.rotate(currentState.a);
				ctx.fillStyle = "rgb(255, 255, 0)";
				ctx.fillRect(0, -1, 6, 2);
				ctx.restore();	
			// Bullet is outside the viewport
			} else {
				
			};
		};
	};
	
	return {
		id: id,
		currentState: currentState,
		getState: getState,
		hasChanged: hasChanged,
		setState: setState,
		updateState: updateState,
		draw: draw
	};
};