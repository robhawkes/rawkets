/**************************************************
** CONNECTION MANAGER
**************************************************/

// Much of this is based on logic from WPilot

var util = r.Util;

r.namespace("Connection");
rawkets.Connection = function (options) {
	var self = this;

	self.messagePriorities = {
		HIGH: 2, // Send with the upmost urgency
		LOW: 1, // Send without getting in the way of high priority messages
		PASS: 0 // Do not send message
	};

	self.connectionStates = {
		CONNECTED: 1, // When player has connected but hasn't been authenticated
		HANDSHAKING: 2, // When player is being authenticated
		JOINED: 3, // When player has been authenticated
		DISCONNECTED: 4 // When player has disconnected
	};

	self.connection = io.connect(options.host, {port: options.port, transports: ["websocket"]});
	self.id = null;
	self.messageTypes = options.messageTypes || {};
	self.typeIndexes = options.typeIndexes || {};
	self.state = null;
	self.debug = options.debug || false;

	// Set up core methods
	self.init();

	// Initialise listeners
	self.initListeners();
};

// Helper variable
var Connection = rawkets.Connection;

Connection.prototype.init = function() {
 	var self = this;

// 	Socket.prototype.queue = [];
// 	Socket.prototype.remoteAddress = null;

// 	// Disconnect player
// 	Socket.prototype.kill = function(reason) {
// 		var client = this,
// 			msg = reason || "Unknown reason";

// 		client.emit("disconnect", msg);
// 		client.onDisconnect();
// 	};

// 	// Add message to queue
// 	Socket.prototype.queue = function(msg) {
// 		var client = this;

// 		if (client.state !== self.connectionStates.JOINED) {
// 			return;
// 		}

// 		client.queue.push(msg);
// 	};

// 	// Flush messages queue
// 	Socket.prototype.flushQueue = function() {
// 		var client = this,
// 			packet;

// 		if (client.queue.length === 0) {
// 			return;
// 		}

// 		packet = client.queue.join(",");
// 		client.emit("message", packet);

// 		client.queue = [];
// 	};
};

// Set the state of the connection
Connection.prototype.setState = function(state) {
	var self = this;

	switch (state) { 
		case self.connectionStates.CONNECTED:
			// Method that can be overridden in game world
			self.onConnected();

			self.send([self.typeIndexes.connect]);

			if (self.debug) {
				util.log("Connected to game server");
			}
			break;
		case self.connectionStates.HANDSHAKING:
			// Method that can be overridden in game world
			self.onHandshaking();
			break;
		case self.connectionStates.JOINED:
			// Method that can be overridden in game world
			self.onJoined();
			break;
		case self.connectionStates.DISCONNECTED:
			// Method that can be overridden in game world
			self.onDisconnected();

			if (self.debug) {
				util.log("Disconnected from game server");
			}
			break;
	}

	self.state = state;
};

Connection.prototype.initListeners = function() {
	var self = this;

	self.connection.on("connect", function() {
		// 1. Store connection id
		self.id = self.connection.socket.sessionid;

		// Connected state is actually set after message types are successfully received in onMessageTypes
	});

	self.connection.on("disconnect", function() {
		self.setState(self.connectionStates.DISCONNECTED);
	});

	self.connection.on("messageTypes", function(packet) {
		self.onMessageTypes(packet);
	});

	self.connection.on("message", function(packet) {
		var msgs = self.processPacket(packet);
		for (var i = 0; i < msgs.length; i++) {
			var msg = msgs[i];
			self.processMessage(msg);
		}
	});
};

Connection.prototype.encodeMessage = function(args) {
	var self = this,
		msg = args.join("|");

	return msg;
};

Connection.prototype.decodeMessage = function(msg) {
	var self = this,
		msgParts = msg.split("|"),
		typeIndex = parseInt(msgParts.shift(), 10),
		type = self.messageTypes[typeIndex],
		args = {};

	msgParts.forEach(function(arg, index) {
		args[type.args[index]] = arg;
	});

	return {typeIndex: typeIndex, type: type, args: args};
};

Connection.prototype.processPacket = function(packet) {
	var self = this,
		messages = [],
		msgArray = [];

	// Rudimentary check to see if message is JSON
	if (packet[2] == "{") {
		messages = [packet];
	} else {
		messages = packet.split(",");
	}

	for (var i = 0; i < messages.length; i++) {
		msgArray.push(self.decodeMessage(messages[i]));
	}

	return msgArray;
};

// Handle the message types sent from the server
Connection.prototype.onMessageTypes = function(packet) {
	var self = this,
		msg = JSON.parse(packet);
	
	self.messageTypes = msg.messageTypes;
	self.typeIndexes = msg.typeIndexes;

	self.setState(self.connectionStates.CONNECTED);

	if (self.debug) {
		util.log("Message types received and set");
		util.log(self.messageTypes);

		util.log("Message type indexes received and set");
		util.log(self.typeIndexes);
	}
};

// Do something with the message sent from the server (overridden)
Connection.prototype.processMessage = function(msg) {};

// Send a message directly to the server, bypassing the queue
Connection.prototype.send = function(args) {
	var self = this,
		msg = self.encodeMessage(args);

	self.connection.emit("message", msg);
};

// // Broadcast a message to all connected players
// // No priority logic so all messages are sent immediately
// Connection.prototype.broadcast = function(args) {
// 	var self = this,
// 		msg = self.encodeMessage(args);
	
// 	for (var id in self.connections) {
// 		var client = self.connections[id];
// 		client.queue.push(msg);
// 	}
// };

// // Broadcast a message to all connected players
// // Callback defines priority for each connection
// Connection.prototype.broadcastEach = function(args, callback) {
// 	var self = this,
// 		msg = self.encodeMessage(args);
	
// 	for (var id in self.connections) {
// 		var client = self.connections[id],
// 			priority = callback(client);

// 		// Skip messages with the pass priority
// 		if (priority === self.messagePriorities.PASS) {
// 			continue;
// 		}

// 		// Additional logic will go here to manage high and low priority messages
// 		// For now all messages with a priority other than pass are treated equally

// 		client.queue.push(msg);
// 	}
// };

// // Flush messages queue
// Connection.prototype.flushQueues = function() {
// 	var self = this;
	
// 	for (var id in self.connections) {
// 		var client = self.connections[id];
// 		client.flushQueue();
// 	}
// };

// Called on new player connection (to be overridden)
Connection.prototype.onConnected = function() {};

// Called on handshaking of player connection (to be overridden)
Connection.prototype.onHandshaking = function() {};

// Called on player successfully joining the game (to be overridden)
Connection.prototype.onJoined = function() {};

// Called on player disconnection (to be overridden)
Connection.prototype.onDisconnected = function() {};