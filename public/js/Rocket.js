/**
 * Rocket ship visualisation and control
 *
 * @author Rob Hawkes
 */

/**
 * @constructor
 */
var Rocket = function() {
	this.angle = 0;
	this.pos = new Vector($(window).width()/2, $(window).height()/2);
	this.rotateLeft = false;
	this.rotateRight = false;
	this.rotationVelocity = 0.15;
};

/**
 * Update rocket
 */
Rocket.prototype.update = function() {
	if (this.rotateLeft) {
		this.angle -= this.rotationVelocity;
	} else if (this.rotateRight) {
		this.angle += this.rotationVelocity;
	}
};

/**
 * Draw rocket onto the canvas
 */
Rocket.prototype.draw = function(ctx) {
	ctx.save();
	ctx.translate(this.pos.x, this.pos.y);
	ctx.rotate(this.angle);
	
	ctx.fillStyle = "rgb(0, 0, 0)";
	ctx.beginPath();
	/*ctx.moveTo(this.pos.x, this.pos.y);
	ctx.lineTo(this.pos.x+5, this.pos.y+10);
	ctx.lineTo(this.pos.x-5, this.pos.y+10);*/
	ctx.moveTo(0, -5);
	ctx.lineTo(4, 5);
	ctx.lineTo(-4, 5);
	ctx.fill();
	
	ctx.restore();
};