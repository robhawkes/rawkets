var sys = require("sys");
var	io = require("socket.io");
var http = require("http");
var player = require("./Player");

var server;
var socket;
var players;

/**
 * Initialises server-side functionality
 */
function init() {
	// Initialise HTTP server
	server = http.createServer(function(req, res) {});		
	server.listen(8080);
	
	// Initialise socket connection
	socket = io.listen(server);
	
	players = [];
	
	// On incoming connection from client
	socket.on("connection", function(client) {
		var p = player;
		
		// On incoming message from client
		client.on("message", function(data) {	
			var json = JSON.parse(data);
			
			// Only deal with messages using the correct protocol
			if (json.type) {
				switch (json.type) {
					case "newPlayer":
						client.broadcast(formatMessage("newPlayer", {id: client.sessionId, x: json.x, y: json.y, angle: json.angle}));
						
						// Send data for existing players
						if (players.length > 0) {
							for (var player in players) {
								client.send(formatMessage("newPlayer", {id: players[player].id, x: players[player].x, y: players[player].y, angle: players[player].angle}));
							}
						}
						
						// Add new player to the stack
						players.push(p.init(client.sessionId, json.x, json.y, json.angle));
						break;
					case "updatePlayer":
						var player;
						try {
							player = playerById(client.sessionId);
							if (player) {
								player.x = json.x;
								player.y = json.y;
								player.angle = json.angle;
								client.broadcast(formatMessage("updatePlayer", {id: client.sessionId, x: json.x, y: json.y, angle: json.angle}));
							} else {
								console.log("Player doesn't exist: ", client.sessionId);
							}
						} catch (e) {
							console.log("Caught error during player update: ", e);
							console.log("Player: ", player);
						};
						break;
					default:
						sys.log("Incoming message ["+client.sessionId+"]: ");
						console.log(json);
				};
			// Invalid message protocol
			} else {
				
			};
		});
		
		// On client disconnect
		client.on('disconnect', function(){
			players.splice(indexOfByPlayerId(client.sessionId), 1);
			client.broadcast(formatMessage("removePlayer", {id: client.sessionId}));
		});	
	});
};

/**
 * Find player by the player id
 *
 * @param {Number} id Type of message
 * @returns Player object
 * @type Player
 */
function playerById(id) {
	for (var i = 0; i < players.length; i++) {
		if (players[i].id == id)
			return players[i];
	}	
}

/**
 * Find index of player by the player id
 *
 * @param {Number} id Type of message
 * @returns Index of player
 * @type Number
 */
function indexOfByPlayerId(id) {
	for (var i = 0; i < players.length; i++) {
		if (players[i].id == id) {
			return i;
		}
	}	
}

/**
 * Format message using game protocols
 *
 * @param {String} type Type of message
 * @param {Object} args Content of message
 * @returns Formatted message as a JSON string. Eg. {type: "update", message: "Hello World"}
 * @type String
 */
function formatMessage(type, args) {
	var msg = {type: type};

	for (var arg in args) {
		// Don't overwrite the message type
		if (arg != "type")
			msg[arg] = args[arg];
	};
	
	return JSON.stringify(msg);
};

// Initialise the server-side functionality
init();