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
	this.worldWidth = 1300;
	this.worldHeight = 1300;
	
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
	if (pos.x < 0 &&
		pos.y < 0) {
		pos.x = Math.abs(pos.x);
		pos.y = Math.abs(pos.y);
	};
	
	return pos;
};

