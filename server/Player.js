/**
 * Creates an instance of Player.
 *
 * @constructor
 * @param {string} id ID of the player
 * @param {Number} x Horizontal position of the player
 * @param {Number} y Vertical position of the player
 * @param {Number} angle Angle of the player
 * @param {Boolean} showFlame Rocket flame on or off
 * @param {String} colour Colour of the player
 * @param {String} name Name of the player
 */
var Player = function(id, x, y, angle, showFlame, colour, name) {
	this.id = id;
	this.x = x;
	this.y = y;
	this.name = name;
	this.age = 0; // Used to detect timed-out players
	this.angle = angle;
	this.ping = 0;
	this.colour = colour;
	this.showFlame = showFlame;
	this.killCount = 0;
	this.alive = false;
	
	this.twitterAccessToken;
	this.twitterAccessTokenSecret;
}

/**
 * Initialises and passes back an instance of Player.
 *
 * @param {string} id The ID of the player
 * @param {Number} x Horizontal position of the player
 * @param {Number} y Vertical position of the player
 * @param {Number} angle Angle of the player
 * @param {Boolean} showFlame Rocket flame on or off
 * @param {String} colour Colour of the player
 * @param {String} name Name of the player
 * @type Player
 * @returns An instance of Player.
 */
exports.init = function(id, x, y, angle, showFlame, colour, name) {
	return new Player(id, x, y, angle, showFlame, colour, name);
}