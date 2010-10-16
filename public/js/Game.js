/**
 * Main controller and core logic for game
 *
 * @author Rob Hawkes
 */

/**
 * @constructor
 */
var Game = function() {
	this.socket = new Socket();
	this.canvas;
	this.ctx;
	
	this.initSocketListeners();
};

/**
 * Initialises socket event listeners
 */
Game.prototype.initSocketListeners = function() {
	this.socket.on("connect", this.onSocketConnect);
	this.socket.on("message", this.onSocketMessage);
	this.socket.on("disconnect", this.onSocketDisconnect);
}

Game.prototype.onSocketConnect = function() {
	console.log("Socket connected");
}

Game.prototype.onSocketMessage = function(data) {
	console.log("Socket message:", data);
}

Game.prototype.onSocketDisconnect = function() {
	console.log("Socket disconnected");
}

/**
 * Format message using game protocols
 *
 * @param {String} type Type of message
 * @param {Object} args Content of message
 * @returns Formatted message as a JSON string. Eg. {type: "update", message: "Hello World"}
 * @type String
 */
Game.formatMessage = function(type, args) {
	var msg = {type: type};

	for (var arg in args) {
		// Don't overwrite the message type
		if (arg != "type")
			msg[arg] = args[arg];
	};

	return JSON.stringify(msg);
}

/**
 * Resizes the canvas element to the same dimensions as the browser window
 */
Game.prototype.resizeCanvas = function() {
	this.canvas.width = $(window).width();
	this.canvas.height = $(window).height();
}