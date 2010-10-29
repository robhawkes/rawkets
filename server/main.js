var util = require("sys");
var OAuth = require("oauth").OAuth;
var	ws = require("websocket-server");
var BISON = require("./bison");
var player = require("./Player");
var socket;
var serverStart;
var players;

var MESSAGE_TYPE_PING = 1;
var MESSAGE_TYPE_UPDATE_PING = 2;
var MESSAGE_TYPE_NEW_PLAYER = 3;
var MESSAGE_TYPE_SET_COLOUR = 4;
var MESSAGE_TYPE_UPDATE_PLAYER = 5;
var MESSAGE_TYPE_REMOVE_PLAYER = 6;

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
			//var json = JSON.parse(msg);
			var data = BISON.decode(msg);
			
			// Only deal with messages using the correct protocol
			if (data.type) {
				switch (data.type) {
					case MESSAGE_TYPE_PING:
						var player = players[indexOfByPlayerId(client.id)];
						
						if (player == null) {
							break;
						};
						
						player.age = 0; // Player is active
						
						var newTimestamp = new Date().getTime();
						//util.log("Round trip: "+(newTimestamp-data.ts)+"ms");
						var ping = newTimestamp-data.t;
						
						// Send ping back to player
						client.send(formatMessage(MESSAGE_TYPE_PING, {i: client.id, p: ping}));
						
						// Broadcast ping to other players
						client.broadcast(formatMessage(MESSAGE_TYPE_UPDATE_PING, {i: client.id, p: ping}));
						
						// Log ping to server after every 10 seconds
						if ((newTimestamp-serverStart) % 10000 <= 3000) {
							util.log("PING ["+client.id+"]: "+ping);
						};
						
						// Request a new ping
						sendPing(client);
						break;
					case MESSAGE_TYPE_NEW_PLAYER:
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
						
						var player = p.init(client.id, data.x, data.y, data.a, colour, name);
										
						player.twitterAccessToken = data.tat;
						player.twitterAccessTokenSecret = data.tats;
						
						var oa = new OAuth(null,
										   null,
										   "UR9lK0nq3KX6Wb2qgO4z5w",
										   "e8jJbu2cj7LxtfS9xnIGLaE4BkuLmvkSUmoBXEOyO4c",
										   "1.0A",
										   null,
										   "HMAC-SHA1");
										
						oa.get("http://api.twitter.com/1/account/verify_credentials.json", player.twitterAccessToken, player.twitterAccessTokenSecret, function(error, data) {
							data = JSON.parse(data);
							player.name = data.screen_name;
							
							client.send(formatMessage(MESSAGE_TYPE_SET_COLOUR, {c: player.colour}));					
							client.broadcast(formatMessage(MESSAGE_TYPE_NEW_PLAYER, {i: client.id, x: player.x, y: player.y, a: player.angle, c: player.colour, n: player.name}));
							
							// Send data for existing players
							if (players.length > 0) {
								for (var playerId in players) {
									if (players[playerId] == null)
										continue;

										client.send(formatMessage(MESSAGE_TYPE_NEW_PLAYER, {i: players[playerId].id, x: players[playerId].x, y: players[playerId].y, a: players[playerId].angle, c: players[playerId].colour, n: players[playerId].name}));
								};
							};

							// Add new player to the stack
							players.push(player);
						});
						break;
					case MESSAGE_TYPE_UPDATE_PLAYER:
						var player;
						try {
							player = players[indexOfByPlayerId(client.id)];
							if (player != null) {
								player.x = data.x;
								player.y = data.y;
								player.angle = data.a;
								client.broadcast(formatMessage(MESSAGE_TYPE_UPDATE_PLAYER, {i: client.id, x: data.x, y: data.y, a: data.a}));
							} else {
								console.log("Player doesn't exist: ", client.id);
							};
						} catch (e) {
							console.log("Caught error during player update: ", e);
							console.log("Player: ", player);
						};
						break;
					default:
						util.log("Incoming message ["+client.id+"]:", data);
				};
			// Invalid message protocol
			} else {
				
			};
		});
		
		// On client disconnect
		client.on("close", function(){
			util.log("CLOSE: "+client.id);
			players.splice(indexOfByPlayerId(client.id), 1);
			client.broadcast(formatMessage(MESSAGE_TYPE_REMOVE_PLAYER, {i: client.id}));
		});	
	});
	
	initPlayerActivityMonitor(players, socket); // Disabled until I can fix the crash
	
	// Catch socket error – this listener seems to catch the ECONNRESET crashes sometimes. Although it seems that the client listener above catches them now.
	/*socket.removeAllListeners("error");
	socket.on("error", function(err) {
		util.log("Socket error 2: "+err);
	});*/
	
	// Start listening for WebSocket connections
	socket.listen(8000);
	util.log("Server listening on port 8000");
};

function initPlayerActivityMonitor(players, socket) {
	setInterval(function() {
		if (players.length > 0) {
			for (var player in players) {
				if (players[player] == null)
					continue;
				
				// If player has been idle for over 30 seconds
				if (players[player].age > 10) {
					socket.broadcast(formatMessage(MESSAGE_TYPE_REMOVE_PLAYER, {i: players[player].id}));
					
					util.log("CLOSE [TIME OUT]: "+players[player].id);
					
					socket.manager.find(players[player].id, function(client) {
						client.close(); // Disconnect player for being idle
					});
					
					players.splice(indexOfByPlayerId(players[player].id), 1);
					continue;
				};
				
				players[player].age += 1; // Increase player age due to inactivity
			};
		};
	}, 3000);	
};

function sendPing(client) {
	setTimeout(function() {
		var timestamp = new Date().getTime();
		client.send(formatMessage(MESSAGE_TYPE_PING, {t: timestamp.toString()}));
	}, 3000);
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
	};	
};

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
		};
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
function formatMessage(type, args) {
	var msg = {type: type};

	for (var arg in args) {
		// Don't overwrite the message type
		if (arg != "type")
			msg[arg] = args[arg];
	};
	
	//return JSON.stringify(msg);
	return BISON.encode(msg);
};

// Initialise the server-side functionality
init();