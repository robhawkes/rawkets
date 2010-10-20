var util = require("util");
var	ws = require("websocket-server");
var player = require("./Player");
var socket;
var players;

/**
 * Initialises server-side functionality
 */
function init() {
	// Initialise WebSocket server
	socket = ws.createServer({debug: true});
	
	players = [];
	
	// On incoming connection from client
	socket.addListener("connection", function(client) {
		var p = player;
		
		sendPing(client);
		
		// On incoming message from client
		client.addListener("message", function(msg) {
			var json = JSON.parse(msg);
			
			// Only deal with messages using the correct protocol
			if (json.type) {
				switch (json.type) {
					case "ping":
						var newTimestamp = new Date().getTime();
						//util.log("Round trip: "+(newTimestamp-json.ts)+"ms");
						client.send(formatMessage("ping", {ping: newTimestamp-json.ts}))
						sendPing(client);
						break;
					/*case "newPlayer":
						client.broadcast(formatMessage("newPlayer", {id: client.id, x: json.x, y: json.y, angle: json.angle}));
						
						// Send data for existing players
						if (players.length > 0) {
							for (var player in players) {
								client.send(formatMessage("newPlayer", {id: players[player].id, x: players[player].x, y: players[player].y, angle: players[player].angle}));
							}
						}
						
						// Add new player to the stack
						players.push(p.init(client.id, json.x, json.y, json.angle));
						break;
					case "updatePlayer":
						var player;
						try {
							player = playerById(client.id);
							if (player) {
								player.x = json.x;
								player.y = json.y;
								player.angle = json.angle;
								client.broadcast(formatMessage("updatePlayer", {id: client.id, x: json.x, y: json.y, angle: json.angle}));
							} else {
								console.log("Player doesn't exist: ", client.id);
							}
						} catch (e) {
							console.log("Caught error during player update: ", e);
							console.log("Player: ", player);
						};
						break;*/
					default:
						util.log("Incoming message ["+client.id+"]:", json);
				};
			// Invalid message protocol
			} else {
				
			};
		});
		
		// On client disconnect
		client.addListener("close", function(){
			//players.splice(indexOfByPlayerId(client.sessionId), 1);
			//client.broadcast(formatMessage("removePlayer", {id: client.sessionId}));
		});	
	});
	
	// Start listening for WebSocket connections
	socket.listen(8080);
	util.log("Server listening on port 8080");
};

function sendPing(client) {
	setTimeout(function() {
		var timestamp = new Date().getTime();
		client.send(formatMessage("ping", {ts: timestamp.toString()}));
	}, 1000);
}

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