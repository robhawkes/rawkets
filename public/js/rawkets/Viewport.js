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
		previousDimensions = {width: width, height: height},
		pos = new r.Vector(worldWidth/2, worldHeight/2), // Centre of the world
		previousPos = new r.Vector(pos.x, pos.y),
		maxStars = 50,
		stars = [],
		flareLeftLower = [new Image(), false],
		flareLeftUpper = [new Image(), false],
		flareRightLower = [new Image(), false],
		flareRightUpper = [new Image(), false];
			
		flareLeftLower[0].src = "style/img/game_flare_left_lower.png";
		flareLeftLower[0].onload = function() {
			flareLeftLower[1] = true;
		};
		
		flareLeftUpper[0].src = "style/img/game_flare_left_upper.png";
		flareLeftUpper[0].onload = function() {
			flareLeftUpper[1] = true;
		};
		
		flareRightLower[0].src = "style/img/game_flare_right_lower.png";
		flareRightLower[0].onload = function() {
			flareRightLower[1] = true;
		};
		
		flareRightUpper[0].src = "style/img/game_flare_right_upper.png";
		flareRightUpper[0].onload = function() {
			flareRightUpper[1] = true;
		};
		
		//console.log(worldWidth, worldHeight, dimensions, pos, previousPos);

		var initStars = function() {
			var i, newStar;
			for (i = 0; i < maxStars; i++) {
				newStar = new r.Star(dimensions.width, dimensions.height);
				stars.push(newStar);
			}
		};
		
		var update = function(x, y) {
			previousPos.x = pos.x;
			previousPos.y = pos.y;
			
			pos.x = x;
			pos.y = y;

			var moveDelta = pos.sub(previousPos),
				starCount = stars.length,
				star,
				i;

			for (i = 0; i < starCount; i++) {
				star = stars[i];
				star.update(moveDelta);
				
				// Wrap stars around screen
				star.pos.x = (star.pos.x < 0) ? dimensions.width : star.pos.x;
				star.pos.x = (star.pos.x > dimensions.width) ? 0 : star.pos.x;
				star.pos.y = (star.pos.y < 0) ? dimensions.height : star.pos.y;
				star.pos.y = (star.pos.y > dimensions.height) ? 0 : star.pos.y;
			}
		};

		var withinBounds = function(x, y) {
			if (x > (pos.x - dimensions.width/2)-20 && 
				x < (pos.x + dimensions.width/2)+20 &&
				y > (pos.y - dimensions.height/2)-20 &&
				y < (pos.y + dimensions.height/2)+20) {
				return true;	
			}

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
			previousDimensions.width = dimensions.width;
			previousDimensions.height = dimensions.height;

			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight-111; // Minus footer and header

			dimensions.width = canvas.width;
			dimensions.height = canvas.height;

			var xRatio = dimensions.width/previousDimensions.width,
				yRatio = dimensions.height/previousDimensions.height,
				starCount = stars.length,
				star,
				s;

			for (s = 0; s < starCount; s++) {
				star = stars[s];
				star.pos.x *= xRatio;
				star.pos.y *= yRatio;
			}
		};
		
		var draw = function() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Draw stars
			var s, starCount = stars.length;
			for (s = 0; s < starCount; s++) {
				star = stars[s];

				if (star === null) {
					continue;
				}

				star.draw(ctx)
			}

			// Draw world boundaries			
			ctx.strokeStyle = "rgba(200, 200, 200, 0.2)";
			ctx.lineWidth = 20;

			var drawPos = new r.Vector(0, 0);
			var drawWidth = 0;
			var drawHeight = 0;

			if (0 > (pos.x - dimensions.width/2)) {
				drawPos.x = worldXToScreenX(0);
			} else {
				drawPos.x = 0;
			}

			if (0 > (pos.y - dimensions.height/2)) {
				drawPos.y = worldYToScreenY(0);
			} else {
				drawPos.y = 0;
			}

			if (worldWidth < (pos.x + dimensions.width/2)) {
				drawWidth = worldXToScreenX(worldWidth)-drawPos.x;
			} else {
				drawWidth = dimensions.width;
			}

			if (worldHeight < (pos.y + dimensions.height/2)) {
				drawHeight = worldYToScreenY(worldHeight)-drawPos.y;
			} else {
				drawHeight = dimensions.height;
			}

			ctx.strokeRect(drawPos.x-(ctx.lineWidth/2), drawPos.y-(ctx.lineWidth/2), drawWidth+ctx.lineWidth, drawHeight+ctx.lineWidth);

			// Draw lens flares
			var flarePos = new r.Vector();
			if (flareLeftLower[1]) {
				flarePos.x = 0-((pos.x/worldWidth)*294);
				flarePos.y = dimensions.height-123-((pos.y/worldHeight)*150);
				ctx.drawImage(flareLeftLower[0], flarePos.x, flarePos.y);
			}
			
			if (flareLeftUpper[1]) {
				flarePos.x = 0-((pos.x/worldWidth)*379);
				flarePos.y = 30+((pos.y/worldHeight)*250);
				ctx.drawImage(flareLeftUpper[0], flarePos.x, flarePos.y);
			}
			
			if (flareRightLower[1]) {
				flarePos.x = dimensions.width-((pos.x/worldWidth)*380);
				flarePos.y = dimensions.height-193-((pos.y/worldHeight)*150);
				ctx.drawImage(flareRightLower[0], flarePos.x, flarePos.y);
			}
			
			if (flareRightUpper[1]) {
				flarePos.x = dimensions.width-((pos.x/worldWidth)*317);
				flarePos.y = 10+((pos.y/worldHeight)*150);
				ctx.drawImage(flareRightUpper[0], flarePos.x, flarePos.y);
			}
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
			draw: draw,
			initStars: initStars
		};
};