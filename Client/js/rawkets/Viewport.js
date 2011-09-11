/**************************************************
** VIEWPORT (DISPLAY)
**************************************************/

r.namespace("Viewport");
rawkets.Viewport = function(canvas, width, height, worldWidth, worldHeight) {
	var canvas = canvas,
		ctx = canvas.getContext("2d"),
		worldWidth = worldWidth,
		worldHeight = worldHeight,
		dimensions = {width: width, height: height},
		pos = new r.Vector(worldWidth/2, worldHeight/2), // Centre of the world
		previousPos = new r.Vector(pos.x, pos.y);
		
		//console.log(worldWidth, worldHeight, dimensions, pos, previousPos);
		
		var update = function(x, y) {
			previousPos.x = pos.x;
			previousPos.y = pos.y;
			
			pos.x = x;
			pos.y = y;
		};

		var withinBounds = function(x, y) {
			if (x > (pos.x - dimensions.width/2)-20 && 
				x < (pos.x + dimensions.width/2)+20 &&
				y > (pos.y - dimensions.height/2)-20 &&
				y < (pos.y + dimensions.height/2)+20) {
				return true;	
			};

			return false;
		};
		
		var worldToScreen = function(x, y) {
			var screenPos = new r.Vector(0, 0);

			screenPos.x = (pos.x - dimensions.width/2) - x;
			screenPos.y = (pos.y - dimensions.height/2) - y;

			screenPos.x *= -1;
			screenPos.y *= -1;

			return screenPos;
		};
		
		var worldXToScreenX = function(x) {
			var x = (pos.x - dimensions.width/2) - x;
			x *= -1;

			return x;
		};
		
		var worldYToScreenY = function(y) {
			var y = (pos.y - dimensions.height/2) - y;
			y *= -1;

			return y;
		};
		
		var onResize = function(e) {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight-111; // Minus footer and header
			dimensions.width = canvas.width;
			dimensions.height = canvas.height;
		};
		
		var draw = function() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.strokeStyle = "rgba(200, 200, 200, 0.2)";
			ctx.lineWidth = 20;

			var drawPos = new r.Vector(0, 0);
			var drawWidth = 0;
			var drawHeight = 0;

			if (0 > (pos.x - dimensions.width/2)) {
				drawPos.x = worldXToScreenX(0);
			} else {
				drawPos.x = 0;
			};

			if (0 > (pos.y - dimensions.height/2)) {
				drawPos.y = worldYToScreenY(0);
			} else {
				drawPos.y = 0;
			};

			if (worldWidth < (pos.x + dimensions.width/2)) {
				drawWidth = worldXToScreenX(worldWidth)-drawPos.x;
			} else {
				drawWidth = dimensions.width;
			};

			if (worldHeight < (pos.y + dimensions.height/2)) {
				drawHeight = worldYToScreenY(worldHeight)-drawPos.y;
			} else {
				drawHeight = dimensions.height;
			};

			ctx.strokeRect(drawPos.x-ctx.lineWidth, drawPos.y-ctx.lineWidth, drawWidth+(ctx.lineWidth*2), drawHeight+(ctx.lineWidth*2));
		};
		
		return {
			ctx: ctx,
			pos: pos,
			dimensions: dimensions,
			previousPos: previousPos,
			update: update,
			withinBounds: withinBounds,
			worldToScreen: worldToScreen,
			onResize: onResize,
			draw: draw
		};
};