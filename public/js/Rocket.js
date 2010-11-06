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
	this.flameHeight = 6;
	this.friction = 0.96;
	this.originalColour = "rgb(0, 255, 0)";
	this.pos = new Vector($(window).width()/2, $(window).height()/2);
	this.rotateLeft = false;
	this.rotateRight = false;
	this.rotationVelocity = 0.15;
	this.showFlame = false;
	this.thrust = 0.5;
	this.velocity = new Vector(0.0, 0.0);
	//this.trailWorld = []; // In world coordinate space
	//this.trail; // In screen coordinate space
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

	this.velocity.x *= this.friction;
	this.velocity.y *= this.friction;
	
	/*if (this.trailWorld && this.trailWorld.length > 10) {
		this.trailWorld.shift();
	};*/
};

/**
 * Draw rocket onto the canvas
 */
Rocket.prototype.draw = function(ctx, active) {
	/*if (this.trail) {
		var trailLength = this.trail.length;
		for (var i = 0; i < trailLength; i++) {
			var trail = this.trail[i];
			ctx.fillStyle = "rgba(255, 255, 255, "+trail.opacity+")";
			ctx.fillRect(trail.pos.x, trail.pos.y, 1, 1);
		};
	};*/
	
	ctx.save();
	ctx.translate(this.pos.x, this.pos.y);
	ctx.rotate(this.angle);
	
	if (this.showFlame) {
		this.flameHeight = (this.flameHeight == 8) ? 6 : 8;
		ctx.fillStyle = "orange";
		//ctx.fillRect(-2, 6, 4, 4);
		ctx.beginPath();
		ctx.moveTo(0, 6+this.flameHeight);
		ctx.lineTo(-2, 6);
		ctx.lineTo(2, 6);
		ctx.closePath();
		ctx.fill();
	}
	
	ctx.fillStyle = this.colour;
	
	// Manually set a default, transparent colour
	if (!active) {
		ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
	};
	
	ctx.beginPath();
	ctx.moveTo(0, -7);
	ctx.lineTo(6, 7);
	ctx.lineTo(-6, 7);
	ctx.closePath();
	ctx.fill();
	
	ctx.restore();
};