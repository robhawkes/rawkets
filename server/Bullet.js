/**
 * Creates an instance of Bullet.
 *
 * @constructor
 * @param {string} playerId ID of the player
 * @param {Number} x Horizontal position of the bullet
 * @param {Number} y Vertical position of the bullet
 * @param {Number} vX Horizontal velocity
 * @param {Number} vY Vertical velocity
 */
var Bullet = function(playerId, x, y, vX, vY) {
	this.id;
	this.playerId = playerId;
	this.x = x;
	this.y = y;
	this.vX = vX;
	this.vY = vY;
	this.age = 0; // Used to detect timed-out bullets
	this.alive = true;
}

/**
 * Initialises and passes back an instance of Bullet.
 *
 * @param {string} playerId ID of the player
 * @param {Number} x Horizontal position of the bullet
 * @param {Number} y Vertical position of the bullet
 * @param {Number} vX Horizontal velocity
 * @param {Number} vY Vertical velocity
 * @type Player
 * @returns An instance of Player.
 */
exports.init = function(playerId, x, y, vX, vY) {
	return new Bullet(playerId, x, y, vX, vY);
}

/**
 * Update bullet
 */
Bullet.prototype.update = function() {	
	this.x += this.vX;
	this.y -= this.vY;
	
	this.age += 1;
	if (this.age > 50) {
		this.alive = false;
	};
};