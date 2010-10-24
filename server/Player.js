/**
 * Creates an instance of Player.
 *
 * @constructor
 * @param {string} id ID of the player
 * @param {Number} x Horizontal position of the player
 * @param {Number} y Vertical position of the player
 * @param {Number} angle Angle of the player
 * @param {String} colour Colour of the player
 * @param {Array} trailWorld Trail behind player
 * @param {String} name Name of the player
 */
var Player = function(id, x, y, angle, colour, trailWorld, name) {
	this.id = id;
	this.x = x;
	this.y = y;
	this.name = name;
	this.angle = angle;
	this.ping = 0;
	this.colour = colour;
	this.trailWorld = trailWorld;
	this.age = 0; // Used to detect timed-out players
}

/**
 * Initialises and passes back an instance of Player.
 *
 * @param {string} id The ID of the player
 * @param {Number} x Horizontal position of the player
 * @param {Number} y Vertical position of the player
 * @param {Number} angle Angle of the player
 * @param {String} colour Colour of the player
 * @param {Array} trailWorld Trail behind player
 * @param {String} name Name of the player
 * @type Player
 * @returns An instance of Player.
 */
exports.init = function(id, x, y, angle, colour, trailWorld, name) {
	return new Player(id, x, y, angle, colour, trailWorld, name);
}