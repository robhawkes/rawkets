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
	this.colour = "rgb(0, 255, 0)";
	this.pos = new Vector($(window).width()/2, $(window).height()/2);
	this.rotateLeft = false;
	this.rotateRight = false;
	this.rotationVelocity = 0.15;
	this.trailWorld = []; // In world coordinate space
	this.trail; // In screen coordinate space
};

/**
 * Update rocket
 */
Rocket.prototype.update = function() {	
	if (this.rotateLeft) {
		this.angle -= this.rotationVelocity;
	} else if (this.rotateRight) {
		this.angle += this.rotationVelocity;
	};

	if (this.trailWorld && this.trailWorld.length > 15) {
		this.trailWorld.shift();
	};
};

/**
 * Draw rocket onto the canvas
 */
Rocket.prototype.draw = function(ctx) {
	if (this.trail) {
		var trailLength = this.trail.length;
		for (var i = 0; i < trailLength; i++) {
			var trail = this.trail[i];
			ctx.fillStyle = "rgba(255, 255, 255, "+trail.opacity+")";
			ctx.fillRect(trail.pos.x, trail.pos.y, 1, 1);
		};
	};
	
	ctx.save();
	ctx.translate(this.pos.x, this.pos.y);
	ctx.rotate(this.angle);
	
	ctx.fillStyle = this.colour;
	ctx.beginPath();
	ctx.moveTo(0, -5);
	ctx.lineTo(4, 5);
	ctx.lineTo(-4, 5);
	ctx.closePath();
	ctx.fill();
	
	ctx.restore();
};