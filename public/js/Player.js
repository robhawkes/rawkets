/**
 * Main controller and core logic for player
 *
 * @author Rob Hawkes
 */

/**
 * @constructor
 * @param {Number} x Horizontal position of player in global space
 * @param {Number} y Vertical position of player in global space
 */
var Player = function(x, y) {
	this.id;
	this.move = false;
	this.ping = 0;
	this.pos = new Vector(x, y);
	this.rocket = new Rocket();
	this.sendUpdate = false;
};

/**
 * Update player
 */
Player.prototype.update = function() {
	this.sendUpdate = false;
	
	this.rocket.update();
	
	if (this.move) {
		this.pos.x += 5*Math.sin(this.rocket.angle);
		this.pos.y -= 5*Math.cos(this.rocket.angle);
	};
	
	if (this.rocket.rotateRight || this.rocket.rotateLeft || this.move)
		this.sendUpdate = true;
};

/**
 * Draw player
 */
Player.prototype.draw = function(ctx) {
	this.rocket.draw(ctx);
	
	if (this.id) {
		ctx.fillStyle = "rgb(255, 255, 255)";
		ctx.font = "10px Courier";
		ctx.fillText(this.id+" | "+this.ping+"ms", this.rocket.pos.x+15, this.rocket.pos.y+2);
	};
};

/**
 * Rotate player left
 */
Player.prototype.rotateLeft = function() {
	//this.rocket.rotateRight = false;
	this.rocket.rotateLeft = true;
};

/**
 * Rotate player right
 */
Player.prototype.rotateRight = function() {
	//this.rocket.rotateLeft = false;
	this.rocket.rotateRight = true;
};

/**
 * Stop rotating player left
 */
Player.prototype.haltRotateLeft = function() {
	this.rocket.rotateLeft = false;
};

/**
 * Stop rotating player right
 */
Player.prototype.haltRotateRight = function() {
	this.rocket.rotateRight = false;
};

/**
 * Move player forwards
 */
Player.prototype.moveForward = function() {
	this.move = true;
};

/**
 * Stop moving player
 */
Player.prototype.haltMove = function() {
	this.move = false;
};