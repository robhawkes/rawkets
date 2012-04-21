/**************************************************
** GAME CONTROLLER
**************************************************/

var util = r.Util;

r.namespace("Game");
rawkets.Game = function() {
	var self = this;

	self.debug = true; // Output debug messages
	self.connection = new r.Connection({host: "localhost", port: 8080, debug: self.debug}); // Connection manager
	self.world = null; // World manager
	self.player = null; // Local player
	
	// var onSocketConnected = function() {
	// 	message = new r.Message(socket);
	// 	message.setEventHandlers();

	// 	clock = new r.Clock(message);
	// 	clock.start();
	// };
	
	// var onClockReady = function(latency) {
	// 	console.log("Clock ready", latency+"ms");
	// 	currentTime = clock.time();

	// 	message.send(message.encode([message.typeIndexes.connect]), true);
	// };

	// // Run when world data is received from server
	// var onWorldData = function(msg) {
	// 	console.log("World data received");
	// 	//startGame();
	// };

	self.init();
};

// Helper variable
var Game = rawkets.Game;

Game.prototype.init = function() {
	var self = this;

	// 1. Set up connection state handlers
	// Overwrite onConnected method
	self.connection.onConnected = function() {
		// 1. Set up message processing handler
		self.connection.processMessage = function(msg) {
			self.processMessage(msg);
		};

		// 2. Initialise bare game world
		self.world = new r.World({connection: self.connection, debug: self.debug});
	};

	// Overwrite onJoined method
	self.connection.onJoined = function() {
		// 1. Let server know that the world data has been handled and the player is ready to join
		self.connection.send([self.connection.typeIndexes.join]);

		if (self.debug) {
			util.log("Successfully joined the game");
		}
	};

	// Overwrite onDisconnected method
	self.connection.onDisconnected = function() {
		// 1. Destroy connection, game world and other related objects
		// 2. Stop game loop
	};
};

Game.prototype.processMessage = function(msg) {
	var self = this,
		connectionStates = self.connection.connectionStates,
		typeIndexes = self.connection.typeIndexes,
		typeIndex = msg.typeIndex,
		args = msg.args;

	switch (typeIndex) {
		case typeIndexes.ping:
			// 1. Let clock class know about the ping and handle it
			break;
		case typeIndexes.connect:
			// 1. Set connection state to handshaking
			self.connection.setState(connectionStates.HANDSHAKING);
			break;
		case typeIndexes.worldData:
			// 1. Handle world data and populate bare world
			var gametype = JSON.parse(args.gametype);
			
			self.world.create(gametype);

			if (self.debug) {
				util.log("World data received and set");
				util.log(gametype);
			}

			// 2. Set connection state to joined
			self.connection.setState(connectionStates.JOINED);
			break;
		case typeIndexes.worldState:
			// 1. Handle and set world state
			var worldState = JSON.parse(args.state);
			self.world.setState(worldState);

			// 2. Set local player
			self.setPlayer(self.world.players[self.connection.id]);

			// 3. Start gameloop
			

			if (self.debug) {
				util.log("World representation received and set");
				util.log(msg);
			}
			break;
		default:
			if (!self.world || self.world.processMessage(msg) === false) {
				if (self.debug) {
					util.log("Unknown message sent from server");
					util.log(msg);
				}
				//self.connection.kill("Unknown message sent from server");
			}
	}
};

// Set local player
Game.prototype.setPlayer = function(player) {
	var self = this;

	if (!player) {
		return;
	}

	// 1. Set player as local player
	player.isMe = true;

	// 2. Store player reference within game
	self.player = player;

	// 3. Store reference to local player within GUI elements

	if (self.debug) {
		util.log("Local player set with id: "+player.id);
		util.log(self.player);
	}
}