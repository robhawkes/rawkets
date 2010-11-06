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
	this.active = false;
	this.alive = false;
	this.allowedToShoot = false;
	this.bullets = [];
	this.id;
	this.fireGun = false;
	this.killCount = 0;
	this.move = false;
	this.name;
	this.ping = 0;
	this.pos = new Vector(x, y);
	this.rocket = new Rocket();
	this.sendUpdate = false;
	this.teleport = false;
};

/**
 * Update player
 */
Player.prototype.update = function(viewport) {
	this.sendUpdate = false;
	
	if (this.teleport) {
		this.sendUpdate = true;
	};	
	
	this.rocket.update();
	
	/*var bulletsLength = this.bullets.length;
	for (var i = 0; i < bulletsLength; i++) {
		var bullet = this.bullets[i];
		
		// Skip elements that don't exist
		if (bullet == null)
			continue;
			
		// Remove old bullets
		if (!bullet.alive) {
			this.bullets.splice(i, 1);
			i--;
			continue;
		};
			
		bullet.update();
		bullet.pos = viewport.worldToScreen(bullet.worldPos.x, bullet.worldPos.y);
	};*/	
	
	/*if (this.rocket.trailWorld.length > 0)
		this.updateTrail(viewport);*/
	
	if (this.move && this.alive) {	
		/*
		// Add new trail to world array
		this.rocket.trailWorld.push({pos: new Vector(this.pos.x, this.pos.y), opacity: 255});
		
		// Calculate offset of new trail from rocket based on world coordinates
		if (this.rocket.trail > 0)
			this.rocket.trail.push({pos: viewport.worldToScreen(this.pos.x, this.pos.y), opacity: 255});
		*/
		
		var a = new Vector(Math.sin(this.rocket.angle)*this.rocket.thrust, Math.cos(this.rocket.angle)*this.rocket.thrust);
		this.rocket.velocity.x += a.x;
		this.rocket.velocity.y += a.y;

		/*this.pos.x += 5*Math.sin(this.rocket.angle);
		this.pos.y -= 5*Math.cos(this.rocket.angle);*/
	};
	
	this.oldPos = new Vector(this.pos.x, this.pos.y);
	
	this.pos.x += this.rocket.velocity.x;
	this.pos.y -= this.rocket.velocity.y;
	
	if (Math.abs(this.oldPos.x - this.pos.x) < 0.1) {
		this.pos.x = this.oldPos.x;
	};
	
	if (Math.abs(this.oldPos.y - this.pos.y) < 0.1) {
		this.pos.y = this.oldPos.y;
	};
	
	if (this.rocket.rotateRight || this.rocket.rotateLeft || this.pos.x != this.oldPos.x || this.pos.y != this.oldPos.y) {
		this.sendUpdate = true;
	};
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
	this.rocket.draw(ctx, this.active);
	
	/*var bulletsLength = this.bullets.length;
	for (var i = 0; i < bulletsLength; i++) {
		var bullet = this.bullets[i];
		
		// Skip elements that don't exist
		if (bullet == null)
			continue;
			
		bullet.draw(ctx);
	};*/
	
	ctx.fillStyle = "rgb(255, 255, 255)";
	ctx.font = "10px Courier";
	
	if (this.name) {
		ctx.fillText(this.name+" | "+this.ping+"ms | "+this.killCount+" kills", this.rocket.pos.x+15, this.rocket.pos.y+2);
	} else {
		ctx.fillText(this.killCount+" kills", this.rocket.pos.x+15, this.rocket.pos.y+2);	
	};
};

/**
 * Rotate player left
 */
Player.prototype.rotateLeft = function() {
	if (this.alive) {
		this.rocket.rotateLeft = true;
	};
};

/**
 * Rotate player right
 */
Player.prototype.rotateRight = function() {
	if (this.alive) {
		this.rocket.rotateRight = true;
	};
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
	if (this.alive) {
		this.move = true;
		this.rocket.showFlame = true;
	};
};

/**
 * Stop moving player
 */
Player.prototype.haltMove = function() {
	this.move = false;
	this.rocket.showFlame = false;
};

/**
 * Shoot a bullet
 */
Player.prototype.shoot = function() {	
	/*var bullet = new Bullet();
	bullet.worldPos.set(this.pos.x, this.pos.y);
	bullet.velocity.set(Math.sin(this.rocket.angle)*bullet.velocityAmount, Math.cos(this.rocket.angle)*bullet.velocityAmount);
	
	this.bullets.push(bullet);*/
	this.allowedToShoot = false;
	var self = this;
	setTimeout(function() {
		self.allowedToShoot = true;
	}, 500);
};

Player.prototype.kill = function(viewport) {
	if (this.alive) {
		this.alive = false;
		this.allowedToShoot = false;
		this.forceUpdate = true;
		this.rocket.rotateLeft = false;
		this.rocket.rotateRight = false;
		this.rocket.showFlame = false;
		this.rocket.colour = "rgba(243, 113, 9, 0.5)";
		
		var self = this;
		setTimeout(function() {
			self.rocket.colour = self.rocket.originalColour;
			self.alive = true;
			
			if (viewport != undefined) {
				self.allowedToShoot = true;
				self.pos.x = Math.random()*viewport.worldWidth;
				self.pos.y = Math.random()*viewport.worldHeight;
				self.teleport = true;
			};
		}, 2000);
	};
};