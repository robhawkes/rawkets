var util = require("sys");
var	ws = require("websocket-server");
var player = require("./Player");
var socket;
var serverStart;
var players;

/**
 * Initialises server-side functionality
 */
function init() {
	// Initialise WebSocket server
	//socket = ws.createServer({debug: true});
	socket = ws.createServer();
	serverStart = new Date().getTime();
	
	players = [];
	
	// On incoming connection from client
	socket.on("connection", function(client) {
		// Attempt to fix ECONNRESET errors
		// This listener is being called without causing any crashes. Good!
		client._req.socket.removeAllListeners("error");
		client._req.socket.on("error", function(err) {
			util.log("Socket error 1: "+err);
		});
		
		util.log("CONNECT: "+client.id);
		
		var p = player;
		sendPing(client);
		
		// On incoming message from client
		client.on("message", function(msg) {
			var json = JSON.parse(msg);
			
			// Only deal with messages using the correct protocol
			if (json.type) {
				switch (json.type) {
					case "ping":
						var newTimestamp = new Date().getTime();
						//util.log("Round trip: "+(newTimestamp-json.ts)+"ms");
						var ping = newTimestamp-json.ts;
						
						// Send ping back to player
						client.send(formatMessage("ping", {id: client.id, ping: ping}));
						
						// Broadcast ping to other players
						client.broadcast(formatMessage("updatePing", {id: client.id, ping: ping}));
						
						// Log ping to server after every 10 seconds
						if ((newTimestamp-serverStart) % 10000 <= 3000) {
							util.log("PING ["+client.id+"]: "+ping);
						};
						
						// Request a new ping
						sendPing(client);
						break;
					case "newPlayer":
						var colour = "rgb(0, 255, 0)";
						var name = client.id;
						switch (client._req.socket.remoteAddress) {
							case "213.104.213.216": // John
								colour = "rgb(255, 255, 0)";
								name = "John";
								break;
							case "93.97.234.238": // Hannah
								colour = "rgb(199, 68, 145)";
								name = "ErisDS";
								break;
							case "87.194.135.193": // Me
							case "127.0.0.1": // Me
								colour = "rgb(217, 65, 30)";
								name = "Rob";
								break;
						};
						
						client.send(formatMessage("setColour", {colour: colour}));
						
						client.broadcast(formatMessage("newPlayer", {id: client.id, x: json.x, y: json.y, angle: json.angle, colour: colour, name: name, trailWorld: json.trailWorld}));
						
						// Send data for existing players
						if (players.length > 0) {
							for (var player in players) {
								client.send(formatMessage("newPlayer", {id: players[player].id, x: players[player].x, y: players[player].y, angle: players[player].angle, ping: players[player].ping, colour: players[player].colour, name: players[player].name, trailWorld: players[player].trailWorld}));
							};
						};
						
						// Add new player to the stack
						players.push(p.init(client.id, json.x, json.y, json.angle, colour, json.trailWorld, name));
						break;
					case "updatePlayer":
						var player;
						try {
							player = players[indexOfByPlayerId(client.id)];
							if (player) {
								player.x = json.x;
								player.y = json.y;
								player.angle = json.angle;
								player.trailWorld = json.trailWorld;
								client.broadcast(formatMessage("updatePlayer", {id: client.id, x: json.x, y: json.y, angle: json.angle, trailWorld: json.trailWorld}));
							} else {
								console.log("Player doesn't exist: ", client.id);
							};
						} catch (e) {
							console.log("Caught error during player update: ", e);
							console.log("Player: ", player);
						};
						break;
					default:
						util.log("Incoming message ["+client.id+"]:", json);
				};
			// Invalid message protocol
			} else {
				
			};
		});
		
		// On client disconnect
		client.on("close", function(){
			util.log("CLOSE: "+client.id);
			players.splice(indexOfByPlayerId(client.id), 1);
			client.broadcast(formatMessage("removePlayer", {id: client.id}));
		});	
	});
	
	// Catch socket error – this listener seems to catch the ECONNRESET crashes sometimes. Although it seems that the client listener above catches them now.
	socket.removeAllListeners("error");
	socket.on("error", function(err) {
		util.log("Socket error 2: "+err);
	});
	
	// Start listening for WebSocket connections
	socket.listen(8000);
	util.log("Server listening on port 8000");
};

function sendPing(client) {
	setTimeout(function() {
		var timestamp = new Date().getTime();
		client.send(formatMessage("ping", {ts: timestamp.toString()}));
	}, 3000);
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