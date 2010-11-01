/**
 * Main controller and core logic for game
 *
 * @author Rob Hawkes
 */

/**
 * @constructor
 */
var Game = function(twitterAccessToken, twitterAccessTokenSecret) {
	this.twitterAccessToken = twitterAccessToken;
	this.twitterAccessTokenSecret = twitterAccessTokenSecret;
	this.authenticated = false;
	
	this.mask = $("#mask");
	this.offline = $("#offline");
	
	this.socket = new Socket();
	this.initSocketListeners(); // I realise this is going to receive unwanted events	
};

/**
 * Message protocols
 */
Game.MESSAGE_TYPE_PING = 1;
Game.MESSAGE_TYPE_UPDATE_PING = 2;
Game.MESSAGE_TYPE_NEW_PLAYER = 3;
Game.MESSAGE_TYPE_SET_COLOUR = 4;
Game.MESSAGE_TYPE_UPDATE_PLAYER = 5;
Game.MESSAGE_TYPE_REMOVE_PLAYER = 6;
Game.MESSAGE_TYPE_AUTHENTICATION_PASSED = 7;
Game.MESSAGE_TYPE_AUTHENTICATION_FAILED = 8;
Game.MESSAGE_TYPE_AUTHENTICATE = 9;

/**
 * Initialise game environment
 */
Game.prototype.initGame = function() {
	this.canvas = $("#canvas");
	this.ctx = this.canvas.get(0).getContext("2d");
	this.resizeCanvas();
	this.stopAnimation = false;
	
	this.ping = $("#ping");
	
	this.player = null;	
	this.players = [];
	
	this.viewport = new Viewport(this.canvas.width(), this.canvas.height());
	this.stars = [];
	this.starsOriginalWidth = this.canvas.width();
	this.starsOriginalHeight = this.canvas.height();
	for (var i = 0; i < 20; i++) {
		this.stars.push(new Star(Math.random()*this.canvas.width(), Math.random()*this.canvas.height()));
	};
	
	this.canvas.fadeIn();
	
	// Initialise player object if one doesn't exist yet
	if (this.player == null) {
		this.player = new Player(1000.0, 1000.0);
		this.socket.send(Game.formatMessage(Game.MESSAGE_TYPE_NEW_PLAYER, {x: this.player.pos.x, y: this.player.pos.y, a: this.player.rocket.angle, f: this.player.rocket.showFlame, tat: this.twitterAccessToken, tats: this.twitterAccessTokenSecret}));
		
		this.timeout();
	};
};

/**
 * Initialises socket event listeners
 */
Game.prototype.initSocketListeners = function() {
	// Horrible passing of game object due to event closure
	var self = this;
	
	this.socket.onopen = function() {
		self.onSocketConnect();
	};
	this.socket.onmessage = function(msg) {
		self.onSocketMessage(msg.data);
	};
	this.socket.onclose = function() {
		self.onSocketDisconnect();
	};
};

/**
 * Event handler for socket connection
 */
Game.prototype.onSocketConnect = function() {
	//console.log("Socket connected");
	
	this.offline.fadeOut();
	this.authenticate();
};

/**
 * Event handler for socket messages
 */
Game.prototype.onSocketMessage = function(msg) {
	try {
		//var json = jQuery.parseJSON(msg);
		var data = BISON.decode(msg);
		
		// Player has been authenticated on the server
		if (this.authenticated) {
			// Only deal with messages using the correct protocol
			if (data.type) {
				switch (data.type) {
					case Game.MESSAGE_TYPE_SET_COLOUR:
						this.player.rocket.colour = data.c;
						break;
					case Game.MESSAGE_TYPE_PING:
						if (data.t) {
							this.socket.send(msg);
						}
					
						if (data.p) {
							this.ping.html("@"+data.n+" - "+data.p+"ms");
						}
						break;
					case Game.MESSAGE_TYPE_NEW_PLAYER:
						var player = new Player(data.x, data.y);
						player.id = data.i;
						player.name = data.n;
						player.rocket.pos = this.viewport.worldToScreen(player.pos.x, player.pos.y);
						player.rocket.angle = data.a;
						player.rocket.colour = data.c;
						player.rocket.showFlame = data.f;
						this.players.push(player);
						break;
					case Game.MESSAGE_TYPE_UPDATE_PLAYER:
						var player = this.getPlayerById(data.i);
						player.pos.x = data.x;
						player.pos.y = data.y;
						player.rocket.angle = data.a;
						player.rocket.showFlame = data.f;
						break
					case Game.MESSAGE_TYPE_UPDATE_PING:
						var player = this.getPlayerById(data.i);
						player.ping = data.p;
						break;
					case Game.MESSAGE_TYPE_REMOVE_PLAYER:
						this.players.splice(this.players.indexOf(this.getPlayerById(data.i)), 1);
						break;
					default:
						//console.log("Incoming message:", json);
				};
			// Invalid message protocol
			} else {
			
			};
		// Player hasn't been authenticated on the server
		} else {
			// Only deal with messages using the correct protocol
			if (data.type) {
				switch (data.type) {
					case Game.MESSAGE_TYPE_AUTHENTICATION_PASSED:
						this.authenticated = true;
						this.initGame();
						break;
					case Game.MESSAGE_TYPE_AUTHENTICATION_FAILED:
						this.mask.fadeIn();
						$("#authenticate").fadeIn();
						break;
					default:
						//console.log("Incoming message:", json);
				};
			// Invalid message protocol
			} else {
			
			};	
		};
	// Data is not a valid JSON string
	} catch (e) {

	};
};

/**
 * Event handler for socket disconnection
 */
Game.prototype.onSocketDisconnect = function() {
	//console.log("Socket disconnected");
	this.mask.fadeIn();
	this.offline.fadeIn();
};

/**
 * Authenticate player on the server
 */
Game.prototype.authenticate = function() {
	var msg = Game.formatMessage(Game.MESSAGE_TYPE_AUTHENTICATE, {tat: this.twitterAccessToken, tats: this.twitterAccessTokenSecret});
	this.socket.send(msg);
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
	};

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
	this.player.update(this.viewport); // Really shouldn't have to pass the viewport here
	
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
	
	var playerMoveDelta = Vector.sub(this.player.pos, this.viewport.pos);
	var starsLength = this.stars.length;
	// This is a resource hog
	for (var i = 0; i < starsLength; i++) {
		var star = this.stars[i];
		
		if (star == null)
			continue;
			
		star.update(playerMoveDelta);
		
		// Wrap stars around screen
		star.pos.x = (star.pos.x < 0) ? this.canvas.width() : star.pos.x;
		star.pos.x = (star.pos.x > this.canvas.width()) ? 0 : star.pos.x;
		star.pos.y = (star.pos.y < 0) ? this.canvas.height() : star.pos.y;
		star.pos.y = (star.pos.y > this.canvas.height()) ? 0 : star.pos.y;
	};
	
	this.viewport.pos.x = this.player.pos.x;
	this.viewport.pos.y = this.player.pos.y;

	var playersLength = this.players.length;
	for (var i = 0; i < playersLength; i++) {
		var player = this.players[i];
		
		if (player == null)
			continue;
		
		// Player is within viewport bounds
		if (this.viewport.withinBounds(player.pos.x, player.pos.y)) {
			player.rocket.pos = this.viewport.worldToScreen(player.pos.x, player.pos.y);
			//player.updateTrail(this.viewport); // Really shouldn't have to pass the viewport here
		// Player is outside of the viewport
		} else {
			
		};
	};
};

/**
 * Draw game elements onto the canvas
 */
Game.prototype.draw = function() {
	this.ctx.clearRect(0, 0, this.canvas.width(), this.canvas.height());
	
	this.viewport.draw(this.ctx);
	
	var starsLength = this.stars.length;
	for (var i = 0; i < starsLength; i++) {
		var star = this.stars[i];
		
		if (star == null)
			continue;
			
		star.draw(this.ctx);
	};
	
	this.player.draw(this.ctx);
	
	var playersLength = this.players.length;
	for (var i = 0; i < playersLength; i++) {
		var player = this.players[i];
		
		if (player == null)
			continue;
		
		// Player is within viewport bounds
		if (this.viewport.withinBounds(player.pos.x, player.pos.y)) {
			player.draw(this.ctx);
		// Player is outside of the viewport
		} else {
			// Draw an arrow at the edge of the viewport indicating where the player is
			var localScreenPos = this.viewport.worldToScreen(this.player.pos.x, this.player.pos.y);
			var screenPos = this.viewport.worldToScreen(player.pos.x, player.pos.y);
			
			var x1 = localScreenPos.x;
			var y1 = localScreenPos.y;
			var x2 = screenPos.x;
			var y2 = screenPos.y;
	
			var x3;
			var y3;
			var x4;
			var y4;
			
			var px;
			var py;
			
			// Check bottom edge
			if (screenPos.y > this.canvas.height()) {
				x3 = 0;
				y3 = this.canvas.height();
				x4 = this.canvas.width();
				y4 = this.canvas.height();
				
				// Can this formula be simplified?
				px = ((((x1*y2)-(y1*x2))*(x3-x4))-((x1-x2)*((x3*y4)-(y3*x4)))) / (((x1-x2)*(y3-y4))-((y1-y2)*(x3-x4)));
				py = ((((x1*y2)-(y1*x2))*(y3-y4))-((y1-y2)*((x3*y4)-(y3*x4)))) / (((x1-x2)*(y3-y4))-((y1-y2)*(x3-x4)));
			
				this.ctx.fillStyle = "rgb(255, 0, 0)";
				this.ctx.fillRect(px-2, py-4, 4, 4);
			};
			
			// Check top edge
			if (screenPos.y < 0) {
				x3 = 0;
				y3 = 0;
				x4 = this.canvas.width();
				y4 = 0;
				
				px = ((((x1*y2)-(y1*x2))*(x3-x4))-((x1-x2)*((x3*y4)-(y3*x4)))) / (((x1-x2)*(y3-y4))-((y1-y2)*(x3-x4)));
				py = ((((x1*y2)-(y1*x2))*(y3-y4))-((y1-y2)*((x3*y4)-(y3*x4)))) / (((x1-x2)*(y3-y4))-((y1-y2)*(x3-x4)));
			
				this.ctx.fillStyle = "rgb(255, 0, 0)";
				this.ctx.fillRect(px-2, py, 4, 4);
			};
			
			// Check left edge
			if (screenPos.x < 0) {
				x3 = 0;
				y3 = 0;
				x4 = 0;
				y4 = this.canvas.height();
				
				px = ((((x1*y2)-(y1*x2))*(x3-x4))-((x1-x2)*((x3*y4)-(y3*x4)))) / (((x1-x2)*(y3-y4))-((y1-y2)*(x3-x4)));
				py = ((((x1*y2)-(y1*x2))*(y3-y4))-((y1-y2)*((x3*y4)-(y3*x4)))) / (((x1-x2)*(y3-y4))-((y1-y2)*(x3-x4)));
			
				this.ctx.fillStyle = "rgb(255, 0, 0)";
				this.ctx.fillRect(px, py-2, 4, 4);
			};
			
			// Check right edge
			if (screenPos.x > this.canvas.width()) {
				x3 = this.canvas.width();
				y3 = 0;
				x4 = this.canvas.width();
				y4 = this.canvas.height();
				
				px = ((((x1*y2)-(y1*x2))*(x3-x4))-((x1-x2)*((x3*y4)-(y3*x4)))) / (((x1-x2)*(y3-y4))-((y1-y2)*(x3-x4)));
				py = ((((x1*y2)-(y1*x2))*(y3-y4))-((y1-y2)*((x3*y4)-(y3*x4)))) / (((x1-x2)*(y3-y4))-((y1-y2)*(x3-x4)));
			
				this.ctx.fillStyle = "rgb(255, 0, 0)";
				this.ctx.fillRect(px-4, py-2, 4, 4);
			};
		};
	};
};

/**
 * Send updated player position to server
 */
Game.prototype.sendPlayerPosition = function() {
	//console.log("Send update");
	this.socket.send(Game.formatMessage(Game.MESSAGE_TYPE_UPDATE_PLAYER, {x: this.player.pos.x, y: this.player.pos.y, a: this.player.rocket.angle, f: this.player.rocket.showFlame}));
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
 * Get player by id
 *
 * @param {Number} id Id of player
 * @returns Player object with specified id
 * @type Player
 */
Game.prototype.getPlayerById = function(id) {
	var playersLength = this.players.length;
	
	for (var i = 0; i < playersLength; i++) {
		var player = this.players[i];
		
		if (player.id == id)
			return player;
	};
};

/**
 * Format message using game protocols
 *
 * @param {String} type Type of message
 * @param {Object} args Content of message
 * @returns Formatted message encoded with BiSON. Eg. {type: "update", message: "Hello World"}
 * @type String
 */
Game.formatMessage = function(type, args) {
	var msg = {type: type};

	for (var arg in args) {
		// Don't overwrite the message type
		if (arg != "type")
			msg[arg] = args[arg];
	};

	//return JSON.stringify(msg);
	return BISON.encode(msg);
};

/**
 * Resizes the canvas element to the same dimensions as the browser window
 */
Game.prototype.resizeCanvas = function(e) {
	// Horrible passing of game object due to event closure
	var self = (e != null) ? e.data.self : this;
	
	var height = $(window).height();
	var width = $(window).width()
	
	self.canvas.attr({height: height, width: width});
	
	if (self.viewport != undefined) {
		self.viewport.height = height;
		self.viewport.width = width;
	};
	
	if (self.player != undefined) {
		self.player.rocket.pos.x = width/2;
		self.player.rocket.pos.y = height/2;
	};
	
	if (self.stars != undefined) {
		var xRatio = width/self.starsOriginalWidth;
		var yRatio = height/self.starsOriginalHeight;
		
		var starsLength = self.stars.length;
		for (var i = 0; i < starsLength; i++) {
			var star = self.stars[i];
		
			if (star == null)
				continue;
			
			star.pos.x *= xRatio;
			star.pos.y *= yRatio;
		};
		
		self.starsOriginalWidth = width;
		self.starsOriginalHeight = height;
	};
};