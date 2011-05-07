// Funky Object clone method
/*Object.prototype.clone = function() {
	var newObj = (this instanceof Array) ? [] : {};
	
	for (i in this) {
		if (i == "clone") continue;
		
		if (this[i] && typeof this[i] == "object") {
			newObj[i] = this[i].clone();
		} else {
			newObj[i] = this[i];
		};
	};
		
	return newObj;
};*/

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
	
	var copy;
    // Handle Array
    if (obj instanceof Array) {
        var i, len = obj.length;
		copy = [];
        for (i = 0; i < len; ++i) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    };

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    };

    throw new Error("Unable to copy obj! Its type isn't supported.");
};

// Vector object
var Vector = function(opts) {
	// Public variables
	var x = opts.x || 0,
		y = opts.y || 0;
		
	return {
		x: x,
		y: y
	};
};

// Player state object
var PlayerState = function(opts) {
	// Public variables
	var currentKeys = {left: false, right: false, up: false, down: false, space: false},
		pos = new Vector({x: opts.x, y: opts.y}),
		thrust = 0,
		maxThrust = 2200,
		acc = new Vector({x: 0, y: 0}),
		angle = 0,
		moving = false,
		health = 100;
		
	return {
		pos: pos,
		acc: acc,
		thrust: thrust,
		maxThrust: maxThrust,
		angle: angle,
		moving: moving,
		currentKeys: currentKeys,
		health: health
	};
};

// Player object
var Player = function(opts) {
	// Public variables
	var id = opts.id || false,
		currentState = new PlayerState({x: opts.x, y: opts.y}),
		previousState = clone(currentState),
		weaponsHot = true,
		rotationSpeed = 0,
		maxRotationSpeed = 0.09,
		screen = new Vector({x: opts.w, y: opts.h});
		//healthTimer = 123;
		
	//console.log(currentState.pos.x);
		
	// Public methods
	var update = function(dtdt) {
		// Update previous state (fix the clone issues)
		previousState.currentKeys = clone(currentState.currentKeys);
		previousState.pos = clone(currentState.pos);
		previousState.angle = currentState.angle;
		previousState.moving = currentState.moving;
		previousState.health = currentState.health;
		//console.log(previousState.pos.x);
		
		// Do stuff depending on what keys are currently pressed down
		/*if (currentState.currentKeys.left) {
			currentState.acc.x = -1500;
		} else if (currentState.currentKeys.right) {
			currentState.acc.x = 1500;
		} else {
			if (Math.abs(currentState.acc.x) < 1) {
				currentState.acc.x = 0;
			} else {
				currentState.acc.x *= 0.96;
			}
		};*/
		
		if (currentState.health <= 0) {
			return;
		};
		
		//console.log(healthTimer);
		
		if (currentState.health < 100) {
			currentState.health += 0.25;
		};
		
		if (currentState.currentKeys.left || currentState.currentKeys.right) {
			rotationSpeed += 0.01;
			if (rotationSpeed > maxRotationSpeed) {
				rotationSpeed = maxRotationSpeed;
			};
		} else {
			rotationSpeed = 0;
		};
		
		if (currentState.currentKeys.left) {
			currentState.angle -= rotationSpeed;
		};
		
		if (currentState.currentKeys.right) {
			currentState.angle += rotationSpeed;
		};
		
		//var acc = new Vector({x: 0, y: 0});
		currentState.moving = false;
		if (currentState.currentKeys.up) {
			currentState.moving = true;
			
			currentState.thrust += 50;
			if (currentState.thrust > currentState.maxThrust) {
				currentState.thrust = currentState.maxThrust;
			};
			
			currentState.acc.x = Math.cos(currentState.angle)*currentState.thrust;
			currentState.acc.y = Math.sin(currentState.angle)*currentState.thrust;
		} else {
			currentState.thrust = 0;
			if (Math.abs(currentState.acc.x) > 0.1 || Math.abs(currentState.acc.y) > 0.1) {
				currentState.acc.x *= 0.96;
				currentState.acc.y *= 0.96;
			} else {
				currentState.acc.x = 0;
				currentState.acc.y = 0;
			};
		};
		
		// Verlet integration (http://www.gotoandplay.it/_articles/2005/08/advCharPhysics.php)
		currentState.pos.x = 2 * currentState.pos.x - previousState.pos.x + currentState.acc.x * dtdt;
		currentState.pos.y = 2 * currentState.pos.y - previousState.pos.y + currentState.acc.y * dtdt;
		
		if (!withinWorldBounds(currentState.pos.x, currentState.pos.y)) {
			if (currentState.pos.x > worldWidth)
				currentState.pos.x = worldWidth;

			if (currentState.pos.x < 0)
				currentState.pos.x = 0;

			if (currentState.pos.y > worldHeight)
				currentState.pos.y = worldHeight;

			if (currentState.pos.y < 0)
				currentState.pos.y = 0;
		};
	};
	
	var respawn = function() {
		currentState.pos.x = 50+Math.random()*(worldWidth-100);
		currentState.pos.y = 50+Math.random()*(worldHeight-100);
	};
	
	var withinScreen = function(pos) {
		if (pos.x >= currentState.pos.x-(screen.x/2) &&
			pos.x <= currentState.pos.x+(screen.x/2) &&
			pos.y >= currentState.pos.y-(screen.y/2) &&
			pos.y <= currentState.pos.y+(screen.y/2)) {
			return true;
		};
		
		return false;
	};
	
	var sendUpdate = function() {
		var client = socket.clients[id];
		
		if (!client) {
			return;
		};
		
		var msg = formatMessage(MESSAGE_TYPE_UPDATE_REMOTE_PLAYER_STATE, {
			id: id, 
			p: currentState.pos, 
			a: currentState.angle, 
			m: currentState.moving, 
			k: currentState.currentKeys, 
			h: currentState.health
		});
		//console.log(BISON.decode(msg));
		msgOutQueue.push({client: client, msg: msg});
		//client.broadcast(msg);
		
		client.send(formatMessage(MESSAGE_TYPE_UPDATE_LOCAL_PLAYER_POSITION, {id: id, p: currentState.pos, a: currentState.angle, m: currentState.moving, h: currentState.health}));
	};

	return {
		id: id, // Should probably be made read-only
		update: update,
		currentState: currentState,
		previousState: previousState,
		weaponsHot: weaponsHot,
		respawn: respawn,
		screen: screen,
		withinScreen: withinScreen,
		sendUpdate: sendUpdate
	};
};

var killPlayer = function(playerId) {
	var player = playerById(playerId);
	if (player) {
		//console.log("Kill player", player.id);
		player.currentState.moving = false;
		player.currentState.acc.x = 0;
		player.currentState.acc.y = 0;
		player.currentState.health = 0;
		var self = player;
		setTimeout(function() {
			//console.log("Revive player", self.id);
			self.respawn();
			self.currentState.health = 100;
			
			var msg;
			//if (client) {
				//client.broadcast(formatMessage(MESSAGE_TYPE_UPDATE_REMOTE_PLAYER_STATE, {id: self.id, state: self.currentState}));
				//client.broadcast(formatMessage(MESSAGE_TYPE_UPDATE_REMOTE_PLAYER_STATE, {id: self.id, pos: self.currentState.pos, angle: self.currentState.angle, moving: self.currentState.moving, keys: self.currentState.currentKeys, health: self.currentState.health}));
				self.sendUpdate();
			//};
		}, 2000);
	};
};

var getPlayerColour = function(sessionId) {
	var client = socket.clients[sessionId],
		colour = false;
		
	if (client) {
	 	switch (client.request.socket.remoteAddress) {
			case "213.104.213.216": // John
				colour = "255,255,0";
				//name = "John";
				break;
			case "93.97.234.238": // Hannah
				colour = "199,68,145";
				//name = "ErisDS";
				break;
			case "87.194.135.193": // Me
			case "127.0.0.1": // Me
				colour = "217,65,30";
				//name = "Rob";
				break;
		};	
	};
	
	return colour;
};

/*var setHealthTimer = function(playerId) {
	var player = playerById(playerId);
	if (player) {
		//var self = player;
		setTimeout(function() {
			var player = playerById(playerId);
			if (player) {
				if (player.currentState.health <= 80) {
					player.currentState.health += 20;
				} else {
					player.currentState.health = 100;
				};
				console.log(player.healthTimer);
				player.healthTimer = 123;
			};
		}, 2000);
	};
};*/

var setBulletTimer = function(playerId) {
	var player = playerById(playerId);
	if (player) {
		player.weaponsHot = false;
		var self = player;
		setTimeout(function() {
			//console.log("Weapons hot", self.id);
			self.weaponsHot = true;
		}, 350);
	};
};

// Bullet state object
var BulletState = function(opts) {
	// Public variables
	var pos = new Vector({x: opts.x, y: opts.y}),
		vel = 6000,
		acc = new Vector({x: Math.cos(opts.angle)*vel, y:Math.sin(opts.angle)*vel}),
		age = 0;
		
	return {
		pos: pos,
		acc: acc,
		age: age
	};
};

// Bullet object
var Bullet = function(opts) {
	// Public variables
	var id = opts.id || false,
		playerId = opts.playerId || false,
		currentState = new BulletState({x: opts.x, y: opts.y, angle: opts.a}),
		previousState = clone(currentState);
		
	// Public methods
	var update = function(dtdt) {
		// Update previous state
		//previousState = clone(currentState);
		previousState.pos = clone(currentState.pos);
		previousState.age = currentState.age;
		
		currentState.age++;
		
		currentState.pos.x = 2 * currentState.pos.x - previousState.pos.x + currentState.acc.x * dtdt;
		currentState.pos.y = 2 * currentState.pos.y - previousState.pos.y + currentState.acc.y * dtdt;
	};
	
	return {
		id: id,
		playerId: playerId,
		currentState: currentState,
		update: update
	};
};

// Message formatter helper
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

// World boundary helper
function withinWorldBounds(x, y) {
	if (x > 0 && 
		x < worldWidth &&
		y > 0 &&
		y < worldHeight) {
		return true;	
	}
	
	return false;
};

// Ping helper
function sendPing(client) {
	setTimeout(function() {
		var timestamp = new Date().getTime();
		client.send(formatMessage(MESSAGE_TYPE_PING, {t: timestamp.toString()}));
	}, 1000);
};

// Message types
var MESSAGE_TYPE_UPDATE_REMOTE_PLAYER_STATE = 0,
	MESSAGE_TYPE_NEW_PLAYER = 1,
	MESSAGE_TYPE_REMOVE_PLAYER = 2,
	MESSAGE_TYPE_ENABLE_PLAYER_KEY = 3,
	MESSAGE_TYPE_DISABLE_PLAYER_KEY = 4,
	MESSAGE_TYPE_UPDATE_LOCAL_PLAYER_POSITION = 5,
	MESSAGE_TYPE_PING = 6,
	MESSAGE_TYPE_NEW_BULLET = 7,
	MESSAGE_TYPE_UPDATE_BULLET_STATE = 8,
	MESSAGE_TYPE_REMOVE_BULLET = 9,
	MESSAGE_TYPE_UPDATE_LOCAL_PLAYER_COLOUR = 10,
	MESSAGE_TYPE_UPDATE_PLAYER_SCREEN = 11;

// Start of main game setup
var http = require("http"), 
	io = require("socket.io"),
	server,
	socket,
	BISON = require("./bison"),
	
	// Run game
	runUpdate = true,
	serverStart = new Date().getTime(),
	
	// Fixed physics update
	t = 0,
	dt = 1/30,
	dtdt = dt*dt,
	
	// Semi-fixed update
	/*dt = 0.1, // Roughly 100 pixels per second at an acceleration of 100 (1-to-1 ratio)
	dtdt = dt*dt,
	currentTime = 0,
	accumulator = 0, // Accumulator to store left over time from physics updates*/
	
	// Fixed update
	/*acceleration = 100/1.0, // Force divided by mass (although, this is acting like velocity here)
	currentState = {x: 0}, // This would be the game entities state after the most recent physics update
	previousState = {x: currentState.x}; // This would be the game entities state for the physics update previous to the current state*/
	
	// Game world
	worldWidth = 2000,
	worldHeight = 2000,
	
	// Players
	players = [],
	
	// Weapons
	bullets = [], // Add this into the player object?
	
	// Communication
	msgInQueue = [], // Incoming messages
	msgOutQueue = []; // Outgoing messages

// HTTP server	
server = http.createServer(function(req, res){});
server.listen(8000);
  
// Socket.IO
socket = io.listen(server, {transports:  ["websocket", "flashsocket"]}); 

// Client connected
socket.on("connection", function(client){
	// Useful client properties and methods
	// client.connected 		Whether the client is connected.
	// client.send(msg) 		Sends a message to the client.
	// client.broadcast(msg)	Sends a message to all other clients.
	
	if (client.sessionId === undefined) {
		console.log("Failed to retrieve client session ID");
		return;
	};
	
	// Add new player to the game
	console.log("New player has connected: ", client.sessionId);
	//players.push(new Player({id: client.sessionId, y: 200, acc: {x: 100}}));
	//console.log("Players connected: ", players.length);
	
	// Send new player to existing players
	//client.broadcast(formatMessage(MESSAGE_TYPE_NEW_PLAYER, {i: client.id, x: player.x, y: player.y, a: player.angle, c: player.colour, f: player.showFlame, n: player.name, k: player.killCount}));
	
	// Sync game state with new player
	var i, player, colour, playerCount = players.length;
	if (playerCount > 0) {
		for (i = 0; i < playerCount; i++) {
			player = players[i];
			colour = getPlayerColour(player.id);
			client.send(formatMessage(MESSAGE_TYPE_NEW_PLAYER, {id: player.id, s: player.currentState, c: colour}));
		};
	};
	 
	// Client disconnected
	client.on("disconnect", function(){
		console.log("Player has disconnected: ", client.sessionId);
		
		var player = playerById(client.sessionId);
		
		// Safely remove player from the game
		if (player) {
			// Remove player from the players array
			var id = player.id;
			players.splice(indexOfByPlayerId(player.id), 1);
			console.log("Removed player: ", id);
			console.log("Players connected: ", players.length);
			
			// Sync other players
			client.broadcast(formatMessage(MESSAGE_TYPE_REMOVE_PLAYER, {id: player.id}));
		};
	});
	
	// Client sent a message
	client.on("message", function(msg){
		// Add message to queue
		msgInQueue.push({client: client, msg: msg});
		
		//console.log(BISON.decode(msg));
		//client.send(msg);
	});
});

// Main update loop
function update() {
	// Clear outgoing messages queue
	//msgOutQueue = [];
	
	// Deal with queued incoming messages
	unqueueIncomingMessages(msgInQueue);
	
	// Clear incoming messages queue (move into unqueueReceivedMessages?)
	msgInQueue = [];
	
	//updatePhysics();
	
	// Update every single player in the game
	var i, player, bullet, bulletPos, timestamp, client, msg, playerCount = players.length;
	for (i = 0; i < playerCount; i++) {
		player = players[i];
		
		if (player) {
			player.update(dtdt);
			
			//console.log(player.previousState.pos.x);
			//console.log(player);
			
			if (player.currentState.health > 20 && player.currentState.currentKeys.space) {
				//console.log(player.weaponsHot, player.id);
				if (player.weaponsHot) {
					bulletPos = new Vector({x: 0, y: 0});
					//console.log("FIRE");
					timestamp = new Date().getTime();

					bulletPos.x = player.currentState.pos.x+(Math.cos(player.currentState.angle)*7);
					bulletPos.y = player.currentState.pos.y+(Math.sin(player.currentState.angle)*7);
					
					var id = timestamp+player.id.toString()+(Math.round(Math.random()*99));
					
					bullet = new Bullet({id: id, playerId: player.id, x: bulletPos.x, y: bulletPos.y, a: player.currentState.angle});
					bullets.push(bullet);
					
					player.currentState.health -= 10;
					
					socket.broadcast(formatMessage(MESSAGE_TYPE_NEW_BULLET, {id: id, x: bullet.currentState.pos.x, y: bullet.currentState.pos.y, a: player.currentState.angle}));
					
					setBulletTimer(players[i].id);
				};
			};
		
			client = socket.clients[player.id];

			if (client) {
				if (Math.abs(player.previousState.pos.x - player.currentState.pos.x) > 0.1 || 
					Math.abs(player.previousState.pos.y - player.currentState.pos.y) > 0.1 || 
					Math.abs(player.previousState.angle != player.currentState.angle) || 
					player.previousState.moving != player.currentState.moving ||
					player.previousState.health != player.currentState.health) {
					//console.log("Update");
					
					/*msg = formatMessage(MESSAGE_TYPE_UPDATE_REMOTE_PLAYER_STATE, {
						id: player.id, 
						pos: player.currentState.pos, 
						angle: player.currentState.angle, 
						moving: player.currentState.moving, 
						keys: player.currentState.currentKeys, 
						health: player.currentState.health
					});
					msgOutQueue.push({client: client, msg: msg});
					//client.broadcast(formatMessage(MESSAGE_TYPE_UPDATE_REMOTE_PLAYER_STATE, {id: player.id, pos: player.currentState.pos, angle: player.currentState.angle, moving: player.currentState.moving, keys: player.currentState.currentKeys, health: player.currentState.health}));
					
					client.send(formatMessage(MESSAGE_TYPE_UPDATE_LOCAL_PLAYER_POSITION, {id: player.id, pos: player.currentState.pos, angle: player.currentState.angle, moving: player.currentState.moving, health: player.currentState.health}));*/
					
					player.sendUpdate();
				};
			};
		};
	};
	
	// Update every single bullet in the game
	var b, alive, deadBullets = [], deadPlayers = [], bulletCount = bullets.length;
	//console.log(bulletCount);
	for (b = 0; b < bulletCount; b++) {
		bullet = bullets[b];
		
		if (bullet) {
			if (bullet.currentState.age > 75) {
				//socket.broadcast(formatMessage(MESSAGE_TYPE_REMOVE_BULLET, {id: bullet.id}));
				deadBullets.push(bullet);
				continue;
			};
			
			bullet.update(dtdt);
			
			// Check for kills
			for (var p = 0; p < playerCount; p++) {
				player = players[p];
				
				if (player.id == bullet.playerId) {
					continue;
				};
				
				if (player && player.currentState.health > 0) {
					var dx = bullet.currentState.pos.x - player.currentState.pos.x;
					var dy = bullet.currentState.pos.y - player.currentState.pos.y;
					var dd = (dx * dx) + (dy * dy);
					var d = Math.sqrt(dd);
			
					if (d < 10) {
						if (player.currentState.health > 0) {
							player.currentState.health -= 35;
						
							if (player.currentState.health <= 0) {
								deadPlayers.push(player);
							};
						
							socket.broadcast(formatMessage(MESSAGE_TYPE_REMOVE_BULLET, {id: bullet.id}));
						};
						deadBullets.push(bullet);
						continue;
					};
				};
			};
			
			//socket.broadcast(formatMessage(MESSAGE_TYPE_UPDATE_BULLET_STATE, {id: bullet.id, x: bullet.currentState.pos.x, y: bullet.currentState.pos.y}));
			msg = formatMessage(MESSAGE_TYPE_UPDATE_BULLET_STATE, {
				id: bullet.id, 
				x: bullet.currentState.pos.x,
				y: bullet.currentState.pos.y
			});
			msgOutQueue.push({client: client, msg: msg});
		};
	};
	
	var dp, deadPlayerCount = deadPlayers.length;
	for (dp = 0; dp < deadPlayerCount; dp++) {
		player = deadPlayers[dp];
		
		if (player) {
			killPlayer(player.id);
			
			client = socket.clients[player.id];
			if (client) {
				//client.broadcast(formatMessage(MESSAGE_TYPE_UPDATE_REMOTE_PLAYER_STATE, {id: player.id, state: player.currentState}));
				//client.broadcast(formatMessage(MESSAGE_TYPE_UPDATE_REMOTE_PLAYER_STATE, {id: player.id, pos: player.currentState.pos, angle: player.currentState.angle, moving: player.currentState.moving, keys: player.currentState.currentKeys, health: player.currentState.health}));
				/*msg = formatMessage(MESSAGE_TYPE_UPDATE_REMOTE_PLAYER_STATE, {
					id: player.id, 
					pos: player.currentState.pos, 
					angle: player.currentState.angle, 
					moving: player.currentState.moving, 
					keys: player.currentState.currentKeys, 
					health: player.currentState.health
				});
				msgOutQueue.push({client: client, msg: msg});
				
				client.send(formatMessage(MESSAGE_TYPE_UPDATE_LOCAL_PLAYER_POSITION, {id: player.id, pos: player.currentState.pos, angle: player.currentState.angle, moving: player.currentState.moving, health: player.currentState.health}));*/
				player.sendUpdate();
			};
		};
	};
	
	// Remove dead bullets
	var db, bulletIndex, deadBulletCount = deadBullets.length;
	for (db = 0; db < deadBulletCount; db++) {
		bullet = deadBullets[db];
		bulletIndex = indexOfByBulletId(deadBullets[db].id);
		
		if (bullet) {
			socket.broadcast(formatMessage(MESSAGE_TYPE_REMOVE_BULLET, {id: bullet.id}));
			bullets.splice(bulletIndex, 1);
			//console.log("Remove bullet", bullets.length);
		};
	};
	
	// Move game time forward
	t += dt;
	
	// Deal with queued outgoing messages
	unqueueOutgoingMessages(msgOutQueue);
	
	// Schedule next game update
	if (runUpdate) {
		setTimeout(update, 1000/60); // Remember, this is however long it take to update PLUS 60ms
	};
};

// Unqueue incoming messages and do stuff with them
function unqueueIncomingMessages(msgQueue) {
	// Check for messages
	if (msgQueue.length == 0) {
		return;
	};
	
	// Copy message queue
	var msgs = msgQueue.slice(0); // Necessary?
	
	// Clear original message queue
	//msgOutQueue = []; // Doesn't seem to act as a reference to the original array
	
	// Do stuff with message queue
	var data, client, msg;
	while (msgs.length > 0) {
		// Grab and remove the oldest message in the array
		data = msgs.shift();
		client = data.client;
		msg = BISON.decode(data.msg);
		
		// Only deal with messages using the correct protocol
		if (msg !== undefined && msg.type !== undefined) {
			var player;
			switch (msg.type) {
				case MESSAGE_TYPE_PING:
					player = players[indexOfByPlayerId(client.sessionId)];
					
					if (player == null) {
						break;
					};
					
					player.age = 0; // Player is active
					
					var newTimestamp = new Date().getTime();
					//console.log("Round trip: "+(newTimestamp-data.ts)+"ms", client.sessionId);
					var ping = newTimestamp-msg.t;
					
					// Send ping back to player
					client.send(formatMessage(MESSAGE_TYPE_PING, {i: player.id, p: ping}));
					
					// Broadcast ping to other players
					//client.broadcast(formatMessage(MESSAGE_TYPE_UPDATE_PING, {i: client.id, p: ping}));
					
					// Log ping to server after every 10 seconds
					if ((newTimestamp-serverStart) % 5000 <= 3000) {
						//console.log("PING ["+client.sessionId+"]: "+ping);
					};
					
					// Request a new ping
					sendPing(client);
					break;
				case MESSAGE_TYPE_NEW_PLAYER:
					console.log("Adding new player: ", client.sessionId);
					var colour = getPlayerColour(client.sessionId);
					
					players.push(new Player({id: client.sessionId, x: worldWidth/2, y: worldWidth/2, w: msg.w, h: msg.h}));
					console.log("Players connected: ", players.length);
					
					// Move into a queueing system
					client.broadcast(formatMessage(MESSAGE_TYPE_NEW_PLAYER, {id: client.sessionId, s: msg.s, c: colour}));
					client.send(formatMessage(MESSAGE_TYPE_UPDATE_LOCAL_PLAYER_COLOUR, {c: colour}));
					sendPing(client);
					break;
				/*case MESSAGE_TYPE_UPDATE_REMOTE_PLAYER_STATE:
					console.log("Update player state: ", client.sessionId);
					
					var player = playerById(client.sessionId);
					if (player) {
						console.log("Player state: ", player.currentState);
					};
					break;*/
				case MESSAGE_TYPE_ENABLE_PLAYER_KEY:
					//console.log("Enable key: ", msg.key);
					player = playerById(client.sessionId);
					if (player) {
						switch (msg.k) {
							case 32: // Space
								player.currentState.currentKeys.space = true;
								break;
							case 37: // Left
								player.currentState.currentKeys.left = true;
								break;
							case 38: // Up
								player.currentState.currentKeys.up = true;
								break;
							case 39: // Right
								player.currentState.currentKeys.right = true;
								break;
							case 40: // Down
								player.currentState.currentKeys.down = true;
								break;
						};
					};
					break;
				case MESSAGE_TYPE_DISABLE_PLAYER_KEY:
					//console.log("Disable key: ", msg.key);
					player = playerById(client.sessionId);
					if (player) {
						switch (msg.k) {
							case 32: // Space
								player.currentState.currentKeys.space = false;
								break;
							case 37: // Left
								player.currentState.currentKeys.left = false;
								break;
							case 38: // Up
								player.currentState.currentKeys.up = false;
								break;
							case 39: // Right
								player.currentState.currentKeys.right = false;
								break;
							case 40: // Down
								player.currentState.currentKeys.down = false;
								break;
						};
					};
					break;
				case MESSAGE_TYPE_UPDATE_PLAYER_SCREEN:
					player = playerById(client.sessionId);
					if (player) {
						player.screen.x = msg.w;
						player.screen.y = msg.h;
					};
					break;
			};
		};
	};
};

// Unqueue outgoing messages and do stuff with them
function unqueueOutgoingMessages(msgQueue) {
	// Check for messages
	if (msgQueue.length == 0) {
		return;
	};
	
	// Copy message queue
	var msgs = msgQueue.slice(0); // Necessary?
	
	// Clear original message queue
	//msgOutQueue = []; // Doesn't seem to act as a reference to the original array
	
	// Do stuff with message queue
	var data, client, msg;
	while (msgs.length > 0) {
		// Grab and remove the oldest message in the array
		data = msgs.shift();
		client = data.client;
		msg = BISON.decode(data.msg);
		
		// Only deal with messages using the correct protocol
		if (msg.type !== undefined) {
			var p, player, playerClient, excudedSessionIds, playerCount;
			switch (msg.type) {
				case MESSAGE_TYPE_UPDATE_REMOTE_PLAYER_STATE:
					// Only broadcast this in full to players that will see this in their screen
 					// Otherwise send a cut down version that only news new coordinates (for off-screen markers)
					excudedSessionIds = [];
					playerCount = players.length;
					for (p = 0; p < playerCount; p++) {
						player = players[p];
						
						if (player.id == msg.id) {
							continue;
						};
						
						if (!player.withinScreen(msg.p)) {
							//excudedSessionIds.push(player.id);
							// Only send position data
							data.msg = formatMessage(MESSAGE_TYPE_UPDATE_REMOTE_PLAYER_STATE, {
								id: msg.id, 
								p: msg.p, // pos
								h: msg.h // health
							});
						} else {
							// Send full state update
							/*data.msg = formatMessage(MESSAGE_TYPE_UPDATE_REMOTE_PLAYER_STATE, {
								id: player.id, 
								pos: player.currentState.pos, 
								angle: player.currentState.angle, 
								moving: player.currentState.moving, 
								keys: player.currentState.currentKeys, 
								health: player.currentState.health
							});*/
						};
						
						playerClient = socket.clients[player.id];
						playerClient.send(data.msg);
					};
					//console.log(excudedSessionIds);
					//socket.broadcast(data.msg, excudedSessionIds);
					break;
				case MESSAGE_TYPE_UPDATE_BULLET_STATE:
					// Only broadcast this in full to players that will see this in their screen
					excudedSessionIds = [];
					playerCount = players.length;
					
					var bulletPos = new Vector({x: msg.x, y: msg.y});
					for (p = 0; p < playerCount; p++) {
						player = players[p];
						
						if (!player.withinScreen(bulletPos)) {
							excudedSessionIds.push(player.id);
						};
					};
					//console.log(excudedSessionIds);
					socket.broadcast(data.msg, excudedSessionIds);
					break;
			};
		};
	};
	
	// Clear outgoing messages queue
	msgOutQueue = [];
};

// Find player by ID
function playerById(id) {
	for (var i = 0; i < players.length; i++) {
		if (players[i].id == id)
			return players[i];
	};
	
	return false;
};

// Find player index by ID
function indexOfByPlayerId(id) {
	for (var i = 0; i < players.length; i++) {
		if (players[i].id == id) {
			return i;
		};
	};
	
	return false;
};

/*
// Find bullet by ID
function bulletById(id) {
	for (var i = 0; i < bullets.length; i++) {
		if (bullets[i].id == id)
			return bullets[i];
	};

	return false;
};
*/
// Find bullet index by ID
function indexOfByBulletId(id) {
	for (var i = 0; i < bullets.length; i++) {
		if (bullets[i].id == id) {
			return i;
		};
	};

	return false;
};

// Start main update loop
update();