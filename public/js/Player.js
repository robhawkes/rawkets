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
	this.name;
	this.ping = 0;
	this.pos = new Vector(x, y);
	this.rocket = new Rocket();
	this.sendUpdate = false;
};

/**
 * Update player
 */
Player.prototype.update = function(viewport) {
	this.sendUpdate = false;
	
	this.rocket.update();
	
	/*if (this.rocket.trailWorld.length > 0)
		this.updateTrail(viewport);*/
	
	if (this.move) {	
		/*
		// Add new trail to world array
		this.rocket.trailWorld.push({pos: new Vector(this.pos.x, this.pos.y), opacity: 255});
		
		// Calculate offset of new trail from rocket based on world coordinates
		if (this.rocket.trail > 0)
			this.rocket.trail.push({pos: viewport.worldToScreen(this.pos.x, this.pos.y), opacity: 255});
		*/
		
		this.pos.x += 5*Math.sin(this.rocket.angle);
		this.pos.y -= 5*Math.cos(this.rocket.angle);
	};
	
	if (this.rocket.rotateRight || this.rocket.rotateLeft || this.move)
		this.sendUpdate = true;
};

/**
 * Update player trail
 */
Player.prototype.updateTrail = function (viewport) {
	this.rocket.trail = [];
	
	// Recalculate existing trail
	var trailWorldLength = this.rocket.trailWorld.length;
	for (var i = 0; i < trailWorldLength; i++) {
		var trail = this.rocket.trailWorld[i]
		trail.opacity *= 0.5;
		if (trail.opacity < 0.1) {
			trail.opacity = 0;
			continue;
		};
		// Calculate offset of existing trail from rocket based on world coordinates
		this.rocket.trail.push({pos: viewport.worldToScreen(trail.pos.x, trail.pos.y), opacity: trail.opacity});
	};
	
	// Remove trail elements that are no longer visible
	for (var j = 0; j < trailWorldLength; j++) {
		var trail = this.rocket.trailWorld[j];
		
		// Skip elements that don't exist
		if (trail == null)
			continue;
		
		if (trail.opacity == 0) {
			this.rocket.trailWorld.splice(j, 1);
		};
	};	
};

/**
 * Draw player
 */
Player.prototype.draw = function(ctx) {
	this.rocket.draw(ctx);
	
	if (this.id) {
		ctx.fillStyle = "rgb(255, 255, 255)";
		ctx.font = "10px Courier";
		ctx.fillText(this.name+" | "+this.ping+"ms", this.rocket.pos.x+15, this.rocket.pos.y+2);
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