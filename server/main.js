var util = require("sys");
var OAuth = require("oauth").OAuth;
var	ws = require("websocket-server");
var BISON = require("./bison");
var player = require("./Player");
var bullet = require("./Bullet");
var fs = require("fs");
var yaml = require("yaml");
var socket;
var serverStart;
var players;
var bullets;

var TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET;
fs.readFile("config.yml", "binary", function(err, file) {
	if (err) {
		util.puts(err);
	};
	
	//util.puts(file.toString());
	var output = yaml.eval(file.toString());
	TWITTER_CONSUMER_KEY = output["TWITTER_CONSUMER_KEY"];
	TWITTER_CONSUMER_SECRET = output["TWITTER_CONSUMER_SECRET"];	
});

/**
 * Message protocols
 */
var MESSAGE_TYPE_PING = 1;
var MESSAGE_TYPE_UPDATE_PING = 2;
var MESSAGE_TYPE_NEW_PLAYER = 3;
var MESSAGE_TYPE_SET_COLOUR = 4;
var MESSAGE_TYPE_UPDATE_PLAYER = 5;
var MESSAGE_TYPE_REMOVE_PLAYER = 6;
var MESSAGE_TYPE_AUTHENTICATION_PASSED = 7;
var MESSAGE_TYPE_AUTHENTICATION_FAILED = 8;
var MESSAGE_TYPE_AUTHENTICATE = 9;
var MESSAGE_TYPE_ERROR = 10;
var MESSAGE_TYPE_ADD_BULLET = 11;
var MESSAGE_TYPE_UPDATE_BULLET = 12;
var MESSAGE_TYPE_REMOVE_BULLET = 13;
var MESSAGE_TYPE_KILL_PLAYER = 14;
var MESSAGE_TYPE_UPDATE_KILLS = 15;
var MESSAGE_TYPE_REVIVE_PLAYER = 16;

/**
 * Initialises server-side functionality
 */
function init() {
	// Initialise WebSocket server
	//socket = ws.createServer({debug: true});
	socket = ws.createServer();
	serverStart = new Date().getTime();
	
	players = [];
	bullets = [];
	
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
		
		// On incoming message from client
		client.on("message", function(msg) {
			//var json = JSON.parse(msg);
			var data = BISON.decode(msg);
			
			// Only deal with messages using the correct protocol
			if (data.type) {
				switch (data.type) {
					case MESSAGE_TYPE_AUTHENTICATE:
						var oa = new OAuth(null,
										   null,
										   TWITTER_CONSUMER_KEY,
										   TWITTER_CONSUMER_SECRET,
										   "1.0A",
										   null,
										   "HMAC-SHA1");
									
						oa.get("http://api.twitter.com/1/account/verify_credentials.json", data.tat, data.tats, function(error, data) {
							try {
								var type;
								if (error != null) {
									type = MESSAGE_TYPE_AUTHENTICATION_FAILED;
								} else {							
									data = JSON.parse(data);
						
									if (data.screen_name != undefined) {
										if (playerByName(data.screen_name) != null) {
											throw {type: "playerExists", msg: "Player already exists"};
										};
									
										type = MESSAGE_TYPE_AUTHENTICATION_PASSED;
									} else {
										type = MESSAGE_TYPE_AUTHENTICATION_FAILED;
									};
								};
								client.send(formatMessage(type, {}));
							} catch (err) {
								client.send(formatMessage(MESSAGE_TYPE_ERROR, {e: err.type, msg: err.msg}));
								client.close();
							};
						});
						break;
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
						client.send(formatMessage(MESSAGE_TYPE_PING, {i: player.id, n: player.name, p: ping}));
						
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
						
						/*switch (client._req.socket.remoteAddress) {
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
						};*/
						
						var player = p.init(client.id, data.x, data.y, data.a, data.f, colour, name);
										
						player.twitterAccessToken = data.tat;
						player.twitterAccessTokenSecret = data.tats;
						
						var oa = new OAuth(null,
										   null,
										   TWITTER_CONSUMER_KEY,
										   TWITTER_CONSUMER_SECRET,
										   "1.0A",
										   null,
										   "HMAC-SHA1");
										
						oa.get("http://api.twitter.com/1/account/verify_credentials.json", player.twitterAccessToken, player.twitterAccessTokenSecret, function(error, data) {
							try {
								if (error != undefined) {
									throw {type: "twitterError", msg: "Error retrieving details from Twitter"};
								};
							
								data = JSON.parse(data);
								player.name = data.screen_name;
							
								if (playerByName(player.name) != null) {
									throw {type: "playerExists", msg: "Player already exists"};
								};
							
								switch (player.name) {
									case "elliottkember": // Eliott
										colour = "rgb(255, 0, 255)";
										break;
									case "JohnONolan": // John
										colour = "rgb(255, 255, 0)";
										break;
									case "ErisDS": // Hannah
										colour = "rgb(199, 68, 145)";
										break;
									case "robhawkes": // Me
										colour = "rgb(217, 65, 30)";
										break;
									case "lizzyrobins":
										colour = "rgb(58, 200, 246)";
										break;
								};
							
								player.colour = colour;
								
								client.send(formatMessage(MESSAGE_TYPE_SET_COLOUR, {i: client.id, c: player.colour}));			
							
								client.broadcast(formatMessage(MESSAGE_TYPE_NEW_PLAYER, {i: client.id, x: player.x, y: player.y, a: player.angle, c: player.colour, f: player.showFlame, n: player.name, k: player.killCount}));
							
								// Send data for existing players
								if (players.length > 0) {
									for (var playerId in players) {
										if (players[playerId] == null)
											continue;

											client.send(formatMessage(MESSAGE_TYPE_NEW_PLAYER, {i: players[playerId].id, x: players[playerId].x, y: players[playerId].y, a: players[playerId].angle, f: players[playerId].showFlame, c: players[playerId].colour, n: players[playerId].name, k: players[playerId].killCount}));
									};
								};
								
								// Send data for exisiting bullets
								if (bullets.length > 0) {
									for (var bulletId in bullets) {
										if (bullets[bulletId] == null)
											continue;

											client.send(formatMessage(MESSAGE_TYPE_ADD_BULLET, {i: b.id, x: bullets[bulletId].x, y: bullets[bulletId].y}));
									};
								};

								// Add new player to the stack
								players.push(player);
								
								sendPing(client);	
							} catch (err) {
								client.send(formatMessage(MESSAGE_TYPE_ERROR, {e: err.type, msg: err.msg}));
								client.close();
							};
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
								player.showFlame = data.f;
								client.broadcast(formatMessage(MESSAGE_TYPE_UPDATE_PLAYER, {i: client.id, x: data.x, y: data.y, a: data.a, f: data.f}));
							} else {
								//console.log("Player doesn't exist: ", client.id);
							};
						} catch (e) {
							console.log("Caught error during player update: ", e);
							console.log("Player: ", player);
						};
						break;
					case MESSAGE_TYPE_ADD_BULLET:
						var b = bullet.init(client.id, data.x, data.y, data.vX, data.vY);
						var timestamp = new Date().getTime();
						b.id = timestamp+client.id.toString();
						bullets.push(b);
						socket.broadcast(formatMessage(MESSAGE_TYPE_ADD_BULLET, {i: b.id, x: data.x, y: data.y}));
						break;
					case MESSAGE_TYPE_REVIVE_PLAYER:
						var player = players[indexOfByPlayerId(client.id)];
						player.alive = true;
						break;
					default:
						util.log("Incoming message ["+client.id+"]: "+data.type);
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
	
	sendBulletUpdates(bullets, socket);
	
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
	// Should probably stop this function from running if there are no players in the game
	setInterval(function() {
		var playersLength = players.length;
		for (var i = 0; i < playersLength; i++) {
			var player = players[i];
			
			if (player == null)
				continue;
			
			// If player has been idle for over 30 seconds
			if (player.age > 10) {
				socket.broadcast(formatMessage(MESSAGE_TYPE_REMOVE_PLAYER, {i: player.id}));
				
				util.log("CLOSE [TIME OUT]: "+player.id);
				
				socket.manager.find(player.id, function(client) {
					client.close(); // Disconnect player for being idle
				});
				
				players.splice(indexOfByPlayerId(player.id), 1);
				i--;
				continue;
			};
			
			player.age += 1; // Increase player age due to inactivity
		};
	}, 3000);	
};

function sendPing(client) {
	setTimeout(function() {
		var timestamp = new Date().getTime();
		client.send(formatMessage(MESSAGE_TYPE_PING, {t: timestamp.toString()}));
	}, 3000);
};

// Change this to a tick/time based animation to avoid jerkiness
function sendBulletUpdates(bullets, socket) {
	function removeBullet(bulletId) {
		socket.broadcast(formatMessage(MESSAGE_TYPE_REMOVE_BULLET, {i: bulletId}));
		bullets.splice(indexOfByBulletId(bulletId), 1);
	}
	
	// Should probably stop this function from running if there are no players in the game
	setInterval(function() {
		//console.log(bullets);
		if (bullets != undefined) {
			var bulletsLength = bullets.length;
			for (var i = 0; i < bulletsLength; i++) {
				var bullet = bullets[i];
				
				if (bullet == null)
					continue;

				bullet.update();
				
				if (!bullet.alive) {
					removeBullet(bullet.id);
					i--;
					continue;
				};
				
				// Check for kill
				var alive = true;
				var playersLength = players.length;
				for (var j = 0; j < playersLength; j++) {
					var player = players[j];

					if (player == null)
						continue;
						
					if (player.id == bullet.playerId)
						continue;

					// Don't kill players who are already dead
					if (!player.alive)
						continue;
						
					var dx = bullet.x - player.x;
					var dy = bullet.y - player.y;
					var dd = (dx * dx) + (dy * dy);
					var d = Math.sqrt(dd);
				
					// Bullet is within kill radius
					if (d < 10) {
						socket.broadcast(formatMessage(MESSAGE_TYPE_KILL_PLAYER, {i: player.id}));
						player.alive = false;
						
						try {
							var bulletPlayer = playerById(bullet.playerId);
							bulletPlayer.killCount++;
							socket.broadcast(formatMessage(MESSAGE_TYPE_UPDATE_KILLS, {i: bulletPlayer.id, k: bulletPlayer.killCount}));
							alive = false;
						} catch (e) {
							
						};
						break;
					};
				};
				
				if (!alive) {
					removeBullet(bullet.id);
					i--;
					continue;
				};
				
				socket.broadcast(formatMessage(MESSAGE_TYPE_UPDATE_BULLET, {i: bullet.id, x: bullet.x, y: bullet.y}));
			};
		};
	}, 30);
};

/**
 * Find player by the player name
 *
 * @param {String} name Name of player
 * @returns Player object
 * @type Player
 */
function playerByName(name) {
	for (var i = 0; i < players.length; i++) {
		if (players[i].name == name)
			return players[i];
	};	
};

/**
 * Find player by the player id
 *
 * @param {Number} id Id of player
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
 * @param {Number} id Id of player
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
 * Find index of bullet by the bullet id
 *
 * @param {Number} id Id of bullet
 * @returns Index of bullet
 * @type Number
 */
function indexOfByBulletId(id) {
	for (var i = 0; i < bullets.length; i++) {
		if (bullets[i].id == id) {
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