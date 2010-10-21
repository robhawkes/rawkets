/**
 * Background stars
 *
 * @author Rob Hawkes
 */

/**
 * @constructor
 * @param {Number} x Horizontal position of star in screen space
 * @param {Number} y Vertical position of star in screen space
 */
var Star = function(x, y) {
	this.pos = new Vector(x, y);
	this.z = Math.random()*0.3;
};

/**
 * Update star
 */
Star.prototype.update = function(movementDelta) {
	this.pos.x -= movementDelta.x*(this.z+0.3);
	this.pos.y -= movementDelta.y*(this.z+0.3);
};

/**
 * Draw star onto the canvas
 */
Star.prototype.draw = function(ctx) {
	ctx.fillStyle = "rgb(255, 255, 255)";
	ctx.beginPath();
	ctx.arc(this.pos.x, this.pos.y, (this.z*10), 0, Math.PI*2, false);
	ctx.closePath();
	ctx.fill();
};