/**
 * Viewport controls and global to local coordinate calculations
 *
 * @author Rob Hawkes
 */

/**
 * @constructor
 * @param {Number} width Width of the viewport
 * @param {Number} height Height of the viewport
 */
var Viewport = function(width, height) {
	this.worldWidth = 2000;
	this.worldHeight = 2000;
	
	this.pos = new Vector(1000.0, 1000.0); // Centre of the world
	this.width = width;
	this.height = height;
};

/**
 * Check to see if given world coordinate is visible within the viewport bounds
 *
 * @param {Number} x Horizontal position
 * @param {Number} y Vertical position
 * @returns Returns true or false depending on wether the coordinate is within the bounds
 * @type Boolean
 */
Viewport.prototype.withinBounds = function(x, y) {
	if (x > this.pos.x - this.width/2 && 
		x < this.pos.x + this.width/2 &&
		y > this.pos.y - this.height/2 &&
		y < this.pos.y + this.height/2) {
		return true;	
	}
	
	return false;
};

/**
 * Check to see if given world coordinate is within the world bounds
 *
 * @param {Number} x Horizontal position
 * @param {Number} y Vertical position
 * @returns Returns true or false depending on wether the coordinate is within the bounds
 * @type Boolean
 */
Viewport.prototype.withinWorldBounds = function(x, y) {
	if (x > 0 && 
		x < this.worldWidth &&
		y > 0 &&
		y < this.worldHeight) {
		return true;	
	}
	
	return false;
};

/**
 * Convert global coordinates to screen coordinates
 *
 * @param {Number} x Horizontal position
 * @param {Number} y Vertical position
 * @returns Returns a vector object containing the screen coordinates
 * @type Vector
 */
Viewport.prototype.globalToScreen = function(x, y) {
	var pos = new Vector(0.0, 0.0);
	
	pos.x = (this.pos.x - this.width/2) - x;
	pos.y = (this.pos.y - this.height/2) - y;
	
	pos.x *= -1;
	pos.y *= -1;
	
	return pos;
};

/**
 * Convert global X coordinate to screen X coordinate
 *
 * @param {Number} x Horizontal position
 * @returns Returns the X screen coordinate
 * @type Number
 */
Viewport.prototype.globalXToScreenX = function(x) {
	var x = (this.pos.x - this.width/2) - x;
	x *= -1;
		
	return x;
};

/**
 * Convert global Y coordinate to screen Y coordinate
 *
 * @param {Number} y Horizontal position
 * @returns Returns the Y screen coordinate
 * @type Number
 */
Viewport.prototype.globalYToScreenY = function(y) {
	var y = (this.pos.y - this.height/2) - y;
	y *= -1;
	
	return y;
};

/**
 * Draw world bounds onto canvas
 *
 * @param {Object} ctx Cavnas 2d drawing context
 */
Viewport.prototype.draw = function(ctx) {
	ctx.fillStyle = "rgb(200, 200, 200)";
	
	var pos = new Vector(0.0, 0.0);
	var width = 100;
	var height = 100;
	
	if (0.0 > (this.pos.x - this.width/2)) {
		pos.x = this.globalXToScreenX(0.0);
	} else {
		pos.x = 0;
	};
	
	if (0.0 > (this.pos.y - this.height/2)) {
		pos.y = this.globalYToScreenY(0.0);
	} else {
		pos.y = 0;
	};
	
	if (this.worldWidth < (this.pos.x + this.width/2)) {
		width = this.globalXToScreenX(this.worldWidth);
	} else {
		width = this.width;
	};
	
	if (this.worldHeight < (this.pos.y + this.height/2)) {
		height = this.globalYToScreenY(this.worldHeight);
	} else {
		height = this.height;
	};
	
	ctx.fillRect(pos.x, pos.y, width, height);
};