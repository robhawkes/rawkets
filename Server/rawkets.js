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

    // Handle Array
    if (obj instanceof Array) {
        var copy = [], i, len = obj.length;
        for (i = 0; i < len; ++i) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    };

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
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
		maxThrust = 1800,
		acc = new Vector({x: 0, y: 0}),
		angle = 0,
		moving = false,
		alive = true;
		
	return {
		pos: pos,
		acc: acc,
		thrust: thrust,
		maxThrust: maxThrust,
		angle: angle,
		moving: moving,
		currentKeys: currentKeys,
		alive: alive
	};
};

// Player object
var Player = function(opts) {
	// Public variables
	var id = opts.id || false,
		currentState = new PlayerState({x: opts.x, y: opts.y}),
		previousState = clone(currentState),
		weaponsHot = true;
		
	//console.log(currentState.pos.x);
		
	// Public methods
	var update = function(dtdt) {
		// Update previous state (fix the clone issues)
		previousState.currentKeys = clone(currentState.currentKeys);
		previousState.pos = clone(currentState.pos);
		previousState.angle = currentState.angle;
		previousState.moving = currentState.moving;
		previousState.alive = currentState.alive;
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
		
		if (!currentState.alive) {
			return;
		};
		
		if (currentState.currentKeys.left) {
			currentState.angle -= 0.06;
		};
		
		if (currentState.currentKeys.right) {
			currentState.angle += 0.06;
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
		
		//console.log(currentState.pos.x);
	};

	return {
		id: id, // Should probably be made read-only
		update: update,
		currentState: currentState,
		previousState: previousState,
		weaponsHot: weaponsHot
	};
};

var killPlayer = function(playerId) {
	var player = playerById(playerId);
	if (player) {
		//console.log("Kill player", player.id);
		player.currentState.moving = false;
		player.currentState.alive = false;
		var self = player;
		setTimeout(function() {
			//console.log("Revive player", self.id);
			self.currentState.alive = true;
			
			var client = socket.clients[player.id];
			if (client) {
				client.broadcast(formatMessage(MESSAGE_TYPE_UPDATE_REMOTE_PLAYER_STATE, {id: player.id, state: player.currentState}));
				client.send(formatMessage(MESSAGE_TYPE_UPDATE_LOCAL_PLAYER_POSITION, {id: player.id, pos: player.currentState.pos, angle: player.currentState.angle, moving: player.currentState.moving, alive: player.currentState.alive}));
			};
		}, 2000);
	};
};

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
		currentState = new BulletState({x: opts.x, y: opts.y, angle: opts.angle}),
		previousState = clone(currentState);
		
	// Public methods
	var update = function(dtdt) {
		// Update previous state
		previousState = clone(currentState);
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
	MESSAGE_TYPE_REMOVE_BULLET = 9;

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
	worldWidth = 1000,
	worldHeight = 1000,
	
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
	var i, playerCount = players.length;
	if (playerCount > 0) {
		for (i = 0; i < playerCount; i++) {
			player = players[i];
			client.send(formatMessage(MESSAGE_TYPE_NEW_PLAYER, {id: player.id, state: player.currentState}));
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
	msgOutQueue = [];
	
	// Deal with queued incoming messages
	unqueueIncomingMessages(msgInQueue);
	
	// Clear incoming messages queue (move into unqueueReceivedMessages?)
	msgInQueue = [];
	
	//updatePhysics();
	
	// Update every single player in the game
	var i, player, bullet, bulletPos, timestamp, client, playerCount = players.length;
	for (i = 0; i < playerCount; i++) {
		player = players[i];
		
		if (player) {
			player.update(dtdt);
			
			//console.log(player.previousState.pos.x);
			//console.log(player);
			
			if (player.currentState.alive && player.currentState.currentKeys.space) {
				//console.log(player.weaponsHot, player.id);
				if (player.weaponsHot) {
					bulletPos = new Vector({x: 0, y: 0});
					//console.log("FIRE");
					timestamp = new Date().getTime();

					bulletPos.x = player.currentState.pos.x+(Math.cos(player.currentState.angle)*7);
					bulletPos.y = player.currentState.pos.y+(Math.sin(player.currentState.angle)*7);
					
					var id = timestamp+player.id.toString()+(Math.round(Math.random()*99));
					
					bullet = new Bullet({id: id, playerId: player.id, x: bulletPos.x, y: bulletPos.y, angle: player.currentState.angle});
					bullets.push(bullet);
					
					socket.broadcast(formatMessage(MESSAGE_TYPE_NEW_BULLET, {id: id, x: bullet.currentState.pos.x, y: bullet.currentState.pos.y}));
					
					setBulletTimer(players[i].id);
				};
			};
		
			client = socket.clients[player.id];

			if (client) {
				if (Math.abs(player.previousState.pos.x - player.currentState.pos.x) > 0.1 || 
					Math.abs(player.previousState.pos.y - player.currentState.pos.y) > 0.1 || 
					Math.abs(player.previousState.angle != player.currentState.angle) || 
					player.previousState.moving != player.currentState.moving) {
					//console.log("Update");
					client.broadcast(formatMessage(MESSAGE_TYPE_UPDATE_REMOTE_PLAYER_STATE, {id: player.id, state: player.currentState}));
					client.send(formatMessage(MESSAGE_TYPE_UPDATE_LOCAL_PLAYER_POSITION, {id: player.id, pos: player.currentState.pos, angle: player.currentState.angle, moving: player.currentState.moving, alive: player.currentState.alive}));
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
			if (bullet.currentState.age > 100) {
				deadBullets.push({bullet: bullet, index: b});
				continue;
			};
			
			bullet.update(dtdt);
			
			// Check for kills
			for (var p = 0; p < playerCount; p++) {
				player = players[p];

				if (player) {
					var dx = bullet.currentState.pos.x - player.currentState.pos.x;
					var dy = bullet.currentState.pos.y - player.currentState.pos.y;
					var dd = (dx * dx) + (dy * dy);
					var d = Math.sqrt(dd);
			
					if (d < 10) {
						deadPlayers.push(player);
						deadBullets.push({bullet: bullet, index: b});
						continue;
					};
				};
			};
			
			socket.broadcast(formatMessage(MESSAGE_TYPE_UPDATE_BULLET_STATE, {id: bullet.id, x: bullet.currentState.pos.x, y: bullet.currentState.pos.y}));
		};
	};
	
	var dp, deadPlayerCount = deadPlayers.length;
	for (dp = 0; dp < deadPlayerCount; dp++) {
		player = deadPlayers[dp];
		
		if (player) {
			killPlayer(player.id);
			
			client = socket.clients[player.id];
			client.broadcast(formatMessage(MESSAGE_TYPE_UPDATE_REMOTE_PLAYER_STATE, {id: player.id, state: player.currentState}));
			client.send(formatMessage(MESSAGE_TYPE_UPDATE_LOCAL_PLAYER_POSITION, {id: player.id, pos: player.currentState.pos, angle: player.currentState.angle, moving: player.currentState.moving, alive: player.currentState.alive}));
		};
	};
	
	// Remove dead bullets
	var db, bulletIndex, deadBulletCount = deadBullets.length;
	for (db = 0; db < deadBulletCount; db++) {
		bullet = deadBullets[db].bullet;
		bulletIndex = deadBullets[db].index;
		
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
						console.log("PING ["+client.sessionId+"]: "+ping);
					};
					
					// Request a new ping
					sendPing(client);
					break;
				case MESSAGE_TYPE_NEW_PLAYER:
					console.log("Adding new player: ", client.sessionId);
					players.push(new Player({id: client.sessionId, x: msg.state.pos.x, y: msg.state.pos.y}));
					console.log("Players connected: ", players.length);
					
					// Move into a queueing system
					client.broadcast(formatMessage(MESSAGE_TYPE_NEW_PLAYER, {id: client.sessionId, state: msg.state}));
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
						switch (msg.key) {
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
						switch (msg.key) {
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
	var data, msg;
	while (msgs.length > 0) {
		// Grab and remove the oldest message in the array
		data = msgs.shift();
		msg = BISON.decode(data.msg);
		
		// Only deal with messages using the correct protocol
		if (msg.type !== undefined) {
			switch (msg.type) {
				// Do stuff and broadcast the messages
			};
		};
	};
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