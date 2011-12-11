/**************************************************
** PLAYER ENTITY
**************************************************/

r.namespace("Player");
rawkets.Player = function(opts) { // Should probably just use a State object, instead of 6 arguments
	var id = opts.id,
		name = opts.name,
		colour = opts.colour || false,
		currentState = new r.State(opts.x, opts.y, opts.a, opts.f, opts.h),
		previousState = new r.State(currentState.p.x, currentState.p.y, currentState.a, currentState.f, currentState.h),
		currentInput = new r.Input(),
		previousInput = new r.Input();
		
	var getState = function(trim) {
		var newState;
		if (trim) {
			// Full state for client prediction
			// newState = r.State(Math.floor(currentState.p.x), Math.floor(currentState.p.y), currentState.a, Math.floor(currentState.f), Math.floor(currentState.v.x), Math.floor(currentState.v.y));
			// Slim state
			newState = r.State(Number(currentState.p.x.toFixed(2)), Number(currentState.p.y.toFixed(2)), Number(currentState.a.toFixed(2)), currentState.f, currentState.h);
			return newState;
		}

		// Full state for client prediction
		// newState = r.State(currentState.p.x, currentState.p.y, currentState.a, currentState.f, currentState.v.x, currentState.v.y);
		// Slim state
		newState = r.State(currentState.p.x, currentState.p.y, currentState.a, currentState.f, currentState.h);
		return newState;
	};

	var getInput = function() {
		var newInput = new r.Input(currentInput.forward, currentInput.rotation, currentInput.fire);
		return newInput;
	};
	
	var getPreviousInput = function() {
		return previousInput;
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

		if (state.v) {
			currentState.v.x = state.v.x;
			currentState.v.y = state.v.y;
		}

		if (state.f >= 0) {
			currentState.f = state.f;	
		}

		currentState.h = state.h;
		currentState.a = state.a;
	};
	
	var updateInput = function(newInput) {
		previousInput = currentInput;
		currentInput = newInput;
	};

	var setColour = function(colourValue) {
		colour = colourValue;
	};
	
	var draw = function(viewport) {
		if (currentState) {
			var ctx = viewport.ctx;
			var screenPos = viewport.worldToScreen(currentState.p.x, currentState.p.y);

			// Player is within the viewport
			if (viewport.withinBounds(currentState.p.x, currentState.p.y)) {
				ctx.save();
				ctx.translate(screenPos.x, screenPos.y);
				
				// Coordinates
				//ctx.fillStyle = "rgb(255, 255, 255)";
				//ctx.fillText("("+currentState.p.x+", "+currentState.p.y+")", 0, 20);

				// Name
				ctx.fillStyle = "rgb(255, 255, 255)";
				ctx.fillText(name, 0, 20);

				// Health ring
				ctx.save();
				ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
				ctx.lineWidth = 10;
				ctx.beginPath();
				ctx.arc(0, 0, 40, 0, Math.PI*2, false);
				ctx.closePath();
				ctx.stroke();	
				ctx.rotate(-Math.PI/2);
				ctx.strokeStyle = "hsla("+120*(currentState.h/100)+", 100%, 50%, 0.1)";
				ctx.beginPath();
				ctx.arc(0, 0, 40, 0, -(Math.PI*2)*(currentState.h/100), true);
				ctx.stroke();
				ctx.restore();
				
				// Rotate canvas for rawket and flame
				ctx.rotate(currentState.a);

				// Draw weapon reticle
				ctx.save();
				ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
				ctx.lineWidth = 4;
				ctx.beginPath();
				ctx.moveTo(35, 0);
				ctx.lineTo(45, 0);
				ctx.closePath();
				ctx.stroke();
				ctx.restore();

				// Flame
				if (currentState.f > 0) {
					flameHeight = Math.floor(8+(Math.random()*4));
					ctx.fillStyle = "orange";
					ctx.beginPath();
					ctx.moveTo(-(6+flameHeight), 0);
					ctx.lineTo(-6, -2);
					ctx.lineTo(-6, 2);
					ctx.closePath();
					ctx.fill();
				}

				// Rawket
				ctx.fillStyle = "rgb(255, 255, 255)";
				ctx.beginPath();
				ctx.moveTo(-7, -6);
				ctx.lineTo(7, 0);
				ctx.lineTo(-7, 6);
				ctx.closePath();
				ctx.fill();

				if (colour) {
					ctx.save();
					ctx.fillStyle = colour;
					ctx.beginPath();
					// ctx.arc(-3, 0, 3, 0, Math.PI*2, false);
					ctx.moveTo(-6, -4);
					ctx.lineTo(5, 0);
					ctx.lineTo(-6, 4);
					ctx.closePath();
					ctx.fill();
					ctx.restore();
				}
				
				ctx.restore();
			// Player is outside the viewport
			} else {
				// Draw an arrow at the edge of the viewport indicating where the player is
				var localScreenPos = viewport.worldToScreen(viewport.pos.x, viewport.pos.y);

				var x1 = localScreenPos.x;
				var y1 = localScreenPos.y;
				var x2 = screenPos.x;
				var y2 = screenPos.y;
				
				var angle = Math.atan2(y1-y2, x1-x2);

				var x3;
				var y3;
				var x4;
				var y4;

				var px;
				var py;

				// Check bottom edge
				if (screenPos.y > viewport.dimensions.height) {
					x3 = 0;
					y3 = viewport.dimensions.height;
					x4 = viewport.dimensions.width;
					y4 = viewport.dimensions.height;

					// Can this formula be simplified?
					px = ((((x1*y2)-(y1*x2))*(x3-x4))-((x1-x2)*((x3*y4)-(y3*x4)))) / (((x1-x2)*(y3-y4))-((y1-y2)*(x3-x4)));
					py = ((((x1*y2)-(y1*x2))*(y3-y4))-((y1-y2)*((x3*y4)-(y3*x4)))) / (((x1-x2)*(y3-y4))-((y1-y2)*(x3-x4)));
					
					px = px;
					py -= 10;
				}

				// Check top edge
				if (screenPos.y < 0) {
					x3 = 0;
					y3 = 0;
					x4 = viewport.dimensions.width;
					y4 = 0;

					px = ((((x1*y2)-(y1*x2))*(x3-x4))-((x1-x2)*((x3*y4)-(y3*x4)))) / (((x1-x2)*(y3-y4))-((y1-y2)*(x3-x4)));
					py = ((((x1*y2)-(y1*x2))*(y3-y4))-((y1-y2)*((x3*y4)-(y3*x4)))) / (((x1-x2)*(y3-y4))-((y1-y2)*(x3-x4)));

					px = px;
					py += 10;
				}

				// Check left edge
				if (screenPos.x < 0) {
					x3 = 0;
					y3 = 0;
					x4 = 0;
					y4 = viewport.dimensions.height;

					var tmpPx, tmpPy;
					tmpPx = ((((x1*y2)-(y1*x2))*(x3-x4))-((x1-x2)*((x3*y4)-(y3*x4)))) / (((x1-x2)*(y3-y4))-((y1-y2)*(x3-x4)));
					tmpPy = ((((x1*y2)-(y1*x2))*(y3-y4))-((y1-y2)*((x3*y4)-(y3*x4)))) / (((x1-x2)*(y3-y4))-((y1-y2)*(x3-x4)));

					// Check that we're not going to overrule the top and bottom checks
					if (tmpPy > 0 && tmpPy < viewport.dimensions.height) {
						px = tmpPx;
						py = tmpPy;

						px += 10;
						py = py;
					}
				}

				// Check right edge
				if (screenPos.x > viewport.dimensions.width) {
					x3 = viewport.dimensions.width;
					y3 = 0;
					x4 = viewport.dimensions.width;
					y4 = viewport.dimensions.height;

					var tmpPx, tmpPy;
					tmpPx = ((((x1*y2)-(y1*x2))*(x3-x4))-((x1-x2)*((x3*y4)-(y3*x4)))) / (((x1-x2)*(y3-y4))-((y1-y2)*(x3-x4)));
					tmpPy = ((((x1*y2)-(y1*x2))*(y3-y4))-((y1-y2)*((x3*y4)-(y3*x4)))) / (((x1-x2)*(y3-y4))-((y1-y2)*(x3-x4)));

					// Check that we're not going to overrule the top and bottom checks
					if (tmpPy > 0 && tmpPy < viewport.dimensions.height) {
						px = tmpPx;
						py = tmpPy;

						px -= 10;
						py = py;
					}
				}

				// Draw debug lines
				// ctx.save();
				// ctx.strokeStyle = "rgb(255, 255, 255)";
				// ctx.lineWidth = 2;
				// ctx.beginPath();
				// ctx.moveTo(x1, y1);
				// ctx.lineTo(x2, y2);
				// ctx.moveTo(x3, y3);
				// ctx.lineTo(x4, y4);
				// ctx.stroke();
				// ctx.restore();
				
				ctx.save();
				ctx.translate(px, py);
				ctx.rotate(angle);
				ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
				ctx.beginPath();
				ctx.moveTo(-5, 0);
				ctx.lineTo(5, 5);
				ctx.lineTo(5, -5);
				ctx.closePath();
				ctx.fill();
				ctx.restore();
			}
		}
	};
	
	return {
		id: id,
		name: name,
		colour: colour,
		currentState: currentState,
		getState: getState,
		getInput: getInput,
		getPreviousInput: getPreviousInput,
		hasChanged: hasChanged,
		setState: setState,
		updateInput: updateInput,
		setColour: setColour,
		draw: draw
	};
};