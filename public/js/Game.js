/**
 * Main controller and core logic for game
 *
 * @author Rob Hawkes
 */

/**
 * @constructor
 */
var Game = function() {
	this.canvas = $("#canvas");
	this.ctx = this.canvas.get(0).getContext("2d");
	
	this.socket = new Socket();
	this.player = null;
	this.players = [];
	
	this.initSocketListeners();
};

/**
 * Initialises socket event listeners
 */
Game.prototype.initSocketListeners = function() {
	// Horrible passing of game object due to event closure
	var self = this;
	
	this.socket.on("connect", function() {
		self.onSocketConnect();
	});
	this.socket.on("message", function(data) {
		self.onSocketMessage(data);
	});
	this.socket.on("disconnect", function() {
		self.onSocketDisconnect();
	});
};

/**
 * Event handler for socket connection
 */
Game.prototype.onSocketConnect = function() {
	console.log("Socket connected");
	
	// Initialise player object if one doesn't exist yet
	if (this.player == null) {
		this.player = new Player();
	};
};

/**
 * Event handler for socket messages
 */
Game.prototype.onSocketMessage = function(data) {
	try {
		var json = jQuery.parseJSON(data);
		
		// Only deal with messages using the correct protocol
		if (json.type) {
			switch (json.type) {
				default:
					console.log("Incoming message:", json);
			};
		// Invalid message protocol
		} else {
			
		};
	// Data is not a valid JSON string
	} catch (e) {

	};
};

/**
 * Event handler for socket disconnection
 */
Game.prototype.onSocketDisconnect = function() {
	console.log("Socket disconnected");
};

/**
 * Move and rotate player based on keyboard input
 */
Game.prototype.movePlayer = function(e) {
	var keyCode = e.keyCode;
	var arrow = {left: 37, up: 38, right: 39, down: 40 };
	
	// Horrible passing of game object due to event closure
	var self = e.data.self;
	self.player.rocket.draw(self.ctx);
	
	switch (keyCode) {
		case arrow.left:
			break;
		case arrow.right:
			break;
		case arrow.up:
			break;
		case arrow.down:
			break;
	};
};

/**
 * Halt player movement
 */
Game.prototype.haltPlayer = function(e) {
	var keyCode = e.keyCode;
	var arrow = {left: 37, up: 38, right: 39, down: 40 };
	
	switch (keyCode) {
		case arrow.left:
			break;
		case arrow.right:
			break;
		case arrow.up:
			break;
		case arrow.down:
			break;
	};
};

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
};

/**
 * Resizes the canvas element to the same dimensions as the browser window
 */
Game.prototype.resizeCanvas = function() {
	this.canvas.width = $(window).width();
	this.canvas.height = $(window).height();
};