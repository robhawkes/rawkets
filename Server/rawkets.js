/**************************************************
** TODO
** - Move communication logic into another file
** - Move messager formatter into a communication
**	 class
**************************************************/

/**************************************************
** MAIN VARIABLES & SETTINGS
**************************************************/

var http = require("http"), 
	io = require("socket.io").listen(8000),
	BISON = require("./bison"),
	Player = require("./Player"),
	server,
	socket,
	rk4 = require("./RK4").init(),
	players = [],
	currentTime = new Date().getTime(), // Current time in ms, used to calculate frame time
	runUpdate = true,
	
	// Message queues
	msgOutQueue = [],
	
	// Message types
	MESSAGE_TYPE_PING = 1,
	MESSAGE_TYPE_SYNC = 2,
	MESSAGE_TYPE_SYNC_COMPLETED = 3,
	MESSAGE_TYPE_NEW_PLAYER = 4,
	MESSAGE_TYPE_UPDATE_PLAYER = 5,
	MESSAGE_TYPE_UPDATE_INPUT = 6,
	MESSAGE_TYPE_REMOVE_PLAYER = 7;
	
/**************************************************
** SET UP HTTP SERVER
**************************************************/

//server = http.createServer(function(req, res){});
//server.listen(8000);

/**************************************************
** SET UP SOCKET SERVER
**************************************************/

io.configure(function() {
	io.set("transports", ["websocket", "flashsocket"]);
	io.set("log level", 2);
});

// Client connected
socket = io.sockets.on("connection", function(client){
	// Useful client properties and methods
	// client.connected 		Whether the client is connected.
	// client.send(msg) 		Sends a message to the client.
	// client.broadcast(msg)	Sends a message to all other clients.
	
	console.log("New player has connected: ", client.id);
	 
	// Client disconnected
	client.on("disconnect", function(){
		console.log("Player has disconnected: ", client.id);
		
		// Remove player safely
		var player = playerById(client.id);
		if (!player) {
			return;
		};
		
		// Remove player from the players array
		var id = player.id;
		players.splice(indexOfByPlayerId(player.id), 1);
		console.log("Removed player from game: ", id);
		console.log("Total players now in game: ", players.length);
		
		client.broadcast.emit("game message", formatMessage(MESSAGE_TYPE_REMOVE_PLAYER, {id: id}));
	});
	
	// Client sent a message
	client.on("game message", function(msg){
		//console.log("Data: ", data);
		//var msg = BISON.decode(data);
		//console.log("Msg: ", msg);

		if (msg.z !== undefined) {
			switch (msg.z) {
				case MESSAGE_TYPE_PING:
					var time = new Date().getTime();
					client.emit("game message", formatMessage(MESSAGE_TYPE_PING, {t: time.toString()}));
					break;
				case MESSAGE_TYPE_SYNC:
					// Add new player to the game
					var localPlayer = Player.init(client.id, 1000, 1000);
					players.push(localPlayer);
					// Send new player to other clients
					client.broadcast.emit("game message", formatMessage(MESSAGE_TYPE_NEW_PLAYER, {id: localPlayer.id, t: currentTime.toString(), s: localPlayer.getState()}));

					console.log("New player added to game: ", client.id, currentTime);
					console.log("Total players now in game: ", players.length);
					
					if (!localPlayer) {
						return;
					};
					
					// Send existing players
					var p, playerCount = players.length;
					for (p = 0; p < playerCount; p++) {
						player = players[p];

						if (!player || player.id == localPlayer.id) {
							continue;
						};

						client.emit("game message", formatMessage(MESSAGE_TYPE_NEW_PLAYER, {id: player.id, t: currentTime.toString(), s: player.getState()}));
					};
					
					// Sync complete
					// Should this wait until client has confirmed sync is complete?
					client.emit("game message", formatMessage(MESSAGE_TYPE_SYNC_COMPLETED, {}));
					break;
				case MESSAGE_TYPE_UPDATE_INPUT:
					var player = playerById(client.id);
					if (player && msg.i) {
						player.updateInput(msg.i);
						console.log("Input updated", currentTime);
					};
					break;
			};
		};
	});
});

/**************************************************
** GAME LOOP
**************************************************/

var localTest = false,
	localCount = 0;
function update() {
	var newTime = new Date().getTime(),
		frameTime = (newTime - currentTime)/1000, // Convert from ms to seconds
		player,
		playerCount = players.length,
		p;
	
	// Limit frame time to avoid "spiral of death"
	if (frameTime > 0.25) {
		console.log("Frametime pegged at 0.25");
		frameTime = 0.25;
	};
	
	// Update game time
	currentTime = newTime;
	
	if (!localTest && playerCount > 0) {
		var localPlayer = players[0];
		//console.log("Start player: "+currentTime, localPlayer.currentState.p.x, localPlayer.currentState.p.y, localPlayer.currentState.v.x, localPlayer.currentState.v.y, localPlayer.currentState.f, localPlayer.currentState.a);
		localTest = true;
	};
	
	// Update player inputs
	for (p = 0; p < playerCount; p++) {
		player = players[p];
		
		if (!player) {
			continue;
		};
		
		// Skip entity if there is no user input and the state hasn't changed
		// For now just update every entity all the time
	
		// Else update the state and continue the physics simulation
		player.updateState();
	};
	
	// Run RK4 simulation
	rk4.accumulator += frameTime;
	while (rk4.accumulator >= rk4.dt) {
		// Start loop through all game entities
		for (p = 0; p < playerCount; p++) {
			player = players[p];
			
			if (!player) {
				continue;
			};
			
			// Skip update if the entity is still
			rk4.integrate(player.currentState);
		};	
		// End loop through all game entities
		
		// Increase simulation time
		//rk4.t += rk4.dt;
		
		// Update accumulator
		rk4.accumulator -= Math.abs(rk4.dt); // Absolute value to allow for reverse time
	};
	
	// ONLY FOR CLIENT
	// Find leftover time due to incomplete physics time delta
	//var alpha = rk4.accumulator / Math.abs(rk4.dt);  // Absolute value to allow for reverse time
	
	// Start loop through all game entities
	for (p = 0; p < playerCount; p++) {
		player = players[p];
		
		if (!player) {
			continue;
		};
		
		if (localCount < 100) {
			//console.log(currentTime, player.getState());
			localCount++;
		};
		
		if (player.getState() && player.getInput()) {
			msgOutQueue.push({msg: formatMessage(MESSAGE_TYPE_UPDATE_PLAYER, {id: player.id, t: currentTime.toString(), s: player.getState(), i: player.getInput()})});
		};
		
		// ONLY FOR CLIENT
		// Interpolate state considering incomplete physics time delta (accumulator)
		//player.interpolate(alpha);
	};
	// End loop through all game entities
	
	// Collision detection can be performed at this point
	
	// Send updates to clients
	// Deal with queued outgoing messages
	unqueueOutgoingMessages(msgOutQueue);
	
	// Clear outgoing messages queue
	msgOutQueue = [];
	
	// Schedule next loop
	if (runUpdate) {;
		setTimeout(update, 1000/60); // Remember, this is however long it take to update PLUS 60ms
	};
};

update();

/**************************************************
** MESSAGE FORMATTER
**************************************************/

function formatMessage(type, args) {
	var msg = {z: type};

	for (var arg in args) {
		// Don't overwrite the message type
		if (arg != "z")
			msg[arg] = args[arg];
	};

	//return BISON.encode(msg);
	return msg;
};

/**************************************************
** MESSAGE QUEUES
**************************************************/

// Unqueue outgoing messages and do stuff with them
function unqueueOutgoingMessages(msgQueue) {
	// Check for messages
	if (msgQueue.length == 0) {
		return;
	};
	
	// Copy message queue
	var msgs = msgQueue.slice(0); // Necessary?
	
	// Do stuff with message queue
	var data, client, msg;
	while (msgs.length > 0) {
		// Grab and remove the oldest message in the array
		data = msgs.shift();
		//client = data.client || false;
		msg = data.msg;
		
		// Only deal with messages using the correct protocol
		if (msg.z !== undefined) {
			switch (msg.z) {
				case MESSAGE_TYPE_UPDATE_PLAYER:
					io.sockets.emit("game message", msg);
					break;
			};
		};
	};
};

/**************************************************
** FINDING PLAYERS
**************************************************/

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
