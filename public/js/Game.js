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
	this.resizeCanvas();
	this.stopAnimation = false;
	
	this.socket = new Socket();
	this.player = null;	
	this.players = [];
	
	this.viewport = new Viewport(this.canvas.width(), this.canvas.height());
	
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
		this.player = new Player(1000.0, 1000.0);
		
		// Add a temporary extra player
		var debugPlayer = new Player(1100.0, 1100.0);
		this.players.push(debugPlayer);
		debugPlayer.rocket.pos = this.viewport.globalToScreen(debugPlayer.pos.x, debugPlayer.pos.y);
		
		this.timeout();
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
 * Main animation loop
 */
Game.prototype.timeout = function() {
	this.update();
	this.draw();
	
	//console.log(this.player.sendUpdate);
	if (this.player.sendUpdate) {
		this.sendPlayerPosition();
	}

	// Horrible passing of game object due to event closure
	var self = this;
	
	if (!this.stopAnimation) {
		setTimeout(function() { self.timeout() }, 30);
	};
};

/**
 * Update game elements
 */
Game.prototype.update = function() {
	this.player.update();
	
	if (!this.viewport.withinWorldBounds(this.player.pos.x, this.player.pos.y)) {
		if (this.player.pos.x > this.viewport.worldWidth)
			this.player.pos.x = this.viewport.worldWidth;
			
		if (this.player.pos.x < 0)
			this.player.pos.x = 0;
			
		if (this.player.pos.y > this.viewport.worldHeight)
			this.player.pos.y = this.viewport.worldHeight;

		if (this.player.pos.y < 0)
			this.player.pos.y = 0;
	};

	var playersLength = this.players.length;
	for (var i = 0; i < playersLength; i++) {
		var player = this.players[i];
		
		if (player == null)
			continue;
		
		// Player is within viewport bounds
		if (this.viewport.withinBounds(player.pos.x, player.pos.y)) {
			player.rocket.pos = this.viewport.globalToScreen(player.pos.x, player.pos.y);
		// Player is outside of the viewport
		} else {
			
		}
	};
};

/**
 * Draw game elements onto the canvas
 */
Game.prototype.draw = function() {
	this.ctx.clearRect(0, 0, this.canvas.width(), this.canvas.height());
	this.player.rocket.draw(this.ctx);
	
	var playersLength = this.players.length;
	for (var i = 0; i < playersLength; i++) {
		var player = this.players[i];
		
		if (player == null)
			continue;
		
		// Player is within viewport bounds
		if (this.viewport.withinBounds(player.pos.x, player.pos.y)) {
			player.rocket.draw(this.ctx);
		// Player is outside of the viewport
		} else {
			// Draw an arrow at the edge of the viewport indicating where the player is
		}
	};
};

/**
 * Send updated player position to server
 */
Game.prototype.sendPlayerPosition = function() {
	//console.log("Send update");
	this.socket.send(Game.formatMessage("updatePlayer", {pos: this.player.pos, angle: this.player.rocket.angle}));
};

/**
 * Move and rotate player based on keyboard input
 */
Game.prototype.movePlayer = function(e) {
	var keyCode = e.keyCode;
	// Refer to key codes using descriptive variables (enumeration)
	var arrow = {left: 37, up: 38, right: 39, down: 40 };
	
	// Horrible passing of game object due to event closure
	var self = e.data.self;
	
	switch (keyCode) {
		case arrow.left:
			if (!self.player.rocket.rotateLeft)
				self.player.rotateLeft();
			break;
		case arrow.right:
			if (!self.player.rocket.rotateRight)
				self.player.rotateRight();
			break;
		case arrow.up:
			if (!self.player.move)
				self.player.moveForward();
			self.viewport.pos = self.player.pos;
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
	// Refer to key codes using descriptive variables (enumeration)
	var arrow = {left: 37, up: 38, right: 39, down: 40 };
	
	// Horrible passing of game object due to event closure
	var self = e.data.self;
	
	switch (keyCode) {
		case arrow.left:
			self.player.haltRotateLeft();
			break;
		case arrow.right:
			self.player.haltRotateRight();
			break;
		case arrow.up:
			self.player.haltMove();
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
Game.prototype.resizeCanvas = function(e) {
	// Horrible passing of game object due to event closure
	var self = (e != null) ? e.data.self : this;
	
	self.canvas.attr({height: $(window).height(), width: $(window).width()});
};