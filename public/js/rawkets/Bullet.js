/**************************************************
** BULLET ENTITY
**************************************************/

// Dumb and super-simple for now

r.namespace("Bullet");
rawkets.Bullet = function(id, x, y, a) { // Should probably just use a State object, instead of 6 arguments
	var id = id,
		currentState = new r.State({x: x, y: y, a: a}),
		targetState = new r.State({x: currentState.p.x, y: currentState.p.y, a: currentState.a});
		
	var getState = function(trim) {
		var newState;
		if (trim) {
			// Full state for client prediction
			// newState = r.State(Math.floor(currentState.p.x), Math.floor(currentState.p.y), currentState.a, Math.floor(currentState.f), Math.floor(currentState.v.x), Math.floor(currentState.v.y));
			// Slim state
			newState = r.State({x: Number(currentState.p.x.toFixed(2)), y: Number(currentState.p.y.toFixed(2)), a: Number(currentState.a.toFixed(2))});
			return newState;
		}

		// Full state for client prediction
		// newState = r.State(currentState.p.x, currentState.p.y, currentState.a, currentState.f, currentState.v.x, currentState.v.y);
		// Slim state
		newState = r.State({x: currentState.p.x, y: currentState.p.y, a: currentState.a});
		return newState;
	};

	var hasChanged = function() {
		if (JSON.stringify(currentState) != JSON.stringify(previousState)) {
			return true;
		}

		return false;
	};
	
	var setState = function(state) {
		currentState.p.x = state.p.x;
		currentState.p.y = state.p.y;
		
		currentState.a = state.a;
	};

	var setTargetState = function(state) {
		targetState.p.x = state.p.x;
		targetState.p.y = state.p.y;

		targetState.a = state.a;
	};

	var update = function() {
		currentState.a = targetState.a;

		// POSITION

		(function() {
			if (currentState.p.x == targetState.p.x &&
				currentState.p.y == targetState.p.y) {
				// Do nothing as target position is same as current position
				return;
			}

			var posDiff = r.Vector();
			posDiff.x = targetState.p.x - currentState.p.x;
			posDiff.y = targetState.p.y - currentState.p.y;

			// Snap to target position if close or far enough
			if ((Math.abs(posDiff.x) < 0.1 && Math.abs(posDiff.y) < 0.1) ||
				(Math.abs(posDiff.x) > 250 || Math.abs(posDiff.y) > 250)) {
				currentState.p.x = targetState.p.x;
				currentState.p.y = targetState.p.y;
				return;
			}

			// Ease toward target position
			currentState.p.x += posDiff.x * 0.2;
			currentState.p.y += posDiff.y * 0.2;
		})();
	}
	
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
				
			}
		}
	};
	
	return {
		id: id,
		currentState: currentState,
		getState: getState,
		hasChanged: hasChanged,
		setState: setState,
		setTargetState: setTargetState,
		update: update,
		draw: draw
	};
};