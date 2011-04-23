// Funky Object clone method
Object.prototype.clone = function() {
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
	// Private variables
	var keys = {left: false, right: false, up: false};
	
	// Public variables
	var pos = new Vector({x: opts.x || 0, y: opts.y || 0}),
		acc = new Vector({x: opts.acc.x || 0, y: opts.acc.y || 0});
		
	return {
		pos: pos,
		acc: acc,
		keys: keys
	};
};

// Player object
var Player = function(opts) {
	// Public variables
	var id = opts.id || false,
		currentState = new PlayerState({x: opts.x || 0, y: opts.y || 0, acc: {x: opts.acc.x || 0, y: opts.acc.y || 0}}),
		previousState = currentState.clone();
		
	// Public methods
	var update = function(dtdt) {
		// Update previous state
		previousState = currentState.clone();
		
		// Do stuff depending on what keys are currently pressed down
		if (currentState.keys.up) {
			currentState.acc.x += 10;
		} else {
			currentState.acc.x = 0;
		};

		// Verlet integration (http://www.gotoandplay.it/_articles/2005/08/advCharPhysics.php)
		currentState.pos.x = 2 * currentState.pos.x - previousState.pos.x + currentState.acc.x * dtdt;
		currentState.pos.y = 2 * currentState.pos.y - previousState.pos.y + currentState.acc.y * dtdt;
	};
	
	return {
		id: id, // Should probably be made read-only
		update: update,
		currentState: currentState,
		previousState: previousState
	};
};

// Message types
var MESSAGE_TYPE_UPDATE_PLAYER = 0;

// Start of main game setup
var http = require("http"), 
	io = require("socket.io"),
	server,
	socket,
	BISON = require("./bison"),
	
	// Run game
	runUpdate = true,
	
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
	
	// Players
	players = [],
	
	// Communication
	msgQueue = [];

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
	players.push(new Player({id: client.sessionId, y: 200, acc: {x: 100}}));
	console.log("Players connected: ", players.length);
	
	// Send new player to existing players
	//client.broadcast(formatMessage(MESSAGE_TYPE_NEW_PLAYER, {i: client.id, x: player.x, y: player.y, a: player.angle, c: player.colour, f: player.showFlame, n: player.name, k: player.killCount}));
	
	// Sync game state with new player
	// HERE
	 
	// Client disconnected
	client.on("disconnect", function(){
		console.log("Player has disconnected: ", client.sessionId);
		
		var player = playerById(client.sessionId);
		
		// Safely remove player from the game
		if (player) {
			// Remove player from the players array
			players.splice(indexOfByPlayerId(client.id), 1);
			console.log("Players connected: ", players.length);
			
			// Sync other players
			//client.broadcast(formatMessage(MESSAGE_TYPE_REMOVE_PLAYER, {i: client.id}));
		};
	});
	
	// Client sent a message
	client.on("message", function(msg){
		// Add message to queue
		msgQueue.push({id: client.sessionId, msg: msg});
		
		//console.log(BISON.decode(msg));
		//client.send(msg);
	});
});

// Main update loop
function update() {
	// Deal with queued messages
	unqueueMessages(msgQueue);
	
	// Clear original message queue (move into unqueueMessages?)
	msgQueue = [];
	
	//updatePhysics();
	
	// Update every single player in the game
	var i, player, numPlayers = players.length;
	for (i = 0; i < numPlayers; i++) {
		player = players[i];
		player.update(dtdt);
	};
	
	//socket.broadcast(JSON.stringify(player.currentState));
	
	// Move game time forward
	t += dt;
	
	// Schedule next game update
	if (runUpdate) {
		setTimeout(update, 1000/60); // Remember, this is however long it take to update PLUS 60ms
	};
};

// Unqueue messages and do stuff with them
function unqueueMessages(msgQueue) {
	// Check for messages
	if (msgQueue.length == 0) {
		return;
	};
	
	// Copy message queue
	var msgs = msgQueue.slice(0); // Necessary?
	
	// Clear original message queue
	//msgQueue = []; // Doesn't seem to act as a reference to the original array
	
	// Do stuff with message queue
	var data, msg;
	while (msgs.length > 0) {
		// Grab and remove the oldest message in the array
		data = msgs.shift();
		msg = BISON.decode(data.msg);
		
		// Only deal with messages using the correct protocol
		if (msg.type !== undefined) {
			switch (msg.type) {
				case MESSAGE_TYPE_UPDATE_PLAYER:
					console.log("Update player: ", data.id);
					
					var player = playerById(data.id);
					if (player) {
						console.log("Player state: ", player.currentState);
					};
					break;
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

// Start main update loop
update();

// Physics update loop (fixed timestep)
/*function updatePhysics() {
	//previousState = {x: currentState.x};
	
	// Verlet integration (http://www.gotoandplay.it/_articles/2005/08/advCharPhysics.php)
	//currentState.x = 2 * currentState.x - previousState.x + acceleration * dtdt;
	
	t += dt;
};*/

/*
// Physics update loop (semi-fixed timestep)
function updatePhysics() {
	// Temporary variables
	var newTime = Date.now();
		frameTime = (newTime - currentTime)/100;
		//accumlatorCount = 0;
		
	//console.log(frameTime);
	
	// Limit frame time to avoid spiral of death
	if (frameTime > 0.5) {
		//console.log(frameTime);
		frameTime = 0.5;
	};
	
	currentTime = newTime;
	accumulator += frameTime;
	
	while (accumulator >= dt) {
		previousState = {x: currentState.x};
		
		// Verlet integration (http://www.gotoandplay.it/_articles/2005/08/advCharPhysics.php)
		//integrate(currentState, t, dt);
		currentState.x = 2 * currentState.x - previousState.x + acceleration * dtdt;
		
		accumulator -= dt;
		//console.log(accumulator);
		//accumlatorCount++;
	};
	
	//console.log(accumlatorCount);

	var alpha = accumulator/dt;
	
	// Interpolate (Gafferongames)
	state = {x: 0};
	state.x = currentState.x*alpha + previousState.x*(1.0 - alpha);
	
	if (runUpdate) {
		setTimeout(updatePhysics, 1000/60);
	};
};

updatePhysics();
*/