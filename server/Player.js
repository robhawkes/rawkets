/**
 * Creates an instance of Player.
 *
 * @constructor
 * @param {string} id ID of the player
 * @param {Number} x Horizontal position of the player
 * @param {Number} y Vertical position of the player
 * @param {Number} angle Angle of the player
 */
var Player = function(id, x, y, angle) {
	this.id = id;
	this.x = x;
	this.y = y;
	this.angle = angle;
}

/**
 * Initialises and passes back an instance of Player.
 *
 * @param {string} id The ID of the player
 * @param {Number} x Horizontal position of the player
 * @param {Number} y Vertical position of the player
 * @param {Number} angle Angle of the player
 * @type Player
 * @returns An instance of Player.
 */
exports.init = function(id, x, y, angle) {
	return new Player(id, x, y, angle);
}