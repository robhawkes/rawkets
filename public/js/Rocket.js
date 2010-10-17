/**
 * Rocket ship visualisation and control
 *
 * @author Rob Hawkes
 */

/**
 * @constructor
 */
var Rocket = function() {
	this.pos = new Vector(0.0, 0.0);
};

Rocket.prototype.draw = function(ctx) {
	ctx.fillStyle = "rgb(0, 0, 0)";
	ctx.moveTo(this.pos.x, this.pos.y);
	ctx.lineTo(this.pos.x+5, this.pos.y+10);
	ctx.lineTo(this.pos.x-5, this.pos.y+10);
	ctx.fill();
};