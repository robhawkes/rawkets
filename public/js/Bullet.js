/**
 * Bullets. Nuff said.
 *
 * @author Rob Hawkes
 */

/**
 * @constructor
 */
var Bullet = function() {
	this.id;
	this.colour = "rgb(0, 255, 0)";
	this.pos = new Vector(0.0, 0.0);
	this.worldPos = new Vector(0.0, 0.0);
};

/**
 * Update bullet
 */
Bullet.prototype.update = function() {	
	
};

/**
 * Draw bullet onto the canvas
 */
Bullet.prototype.draw = function(ctx) {
	ctx.fillStyle = "rgb(255, 255, 0)";
	//ctx.beginPath();
	//ctx.arc(this.pos.x, this.pos.y, 2, 0, Math.PI*2, false);
	//ctx.closePath();
	//ctx.fill();
	ctx.fillRect(this.pos.x-1, this.pos.y-1, 2, 2);
};