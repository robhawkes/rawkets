exports.init = init;

/**************************************************
** TODO
** - Move communication logic into another file
** - Move messager formatter into a communication
**   class
**************************************************/

/**************************************************
** MAIN VARIABLES & SETTINGS
**************************************************/

var Express = require("./Express").Express.init(),
	sys = require("sys"),
	io = require("socket.io").listen(Express.app),
	Input = require("./Input"),
	Vector = require("./Vector"),
	Player = require("./Player"),
	PlayerAI = require("./PlayerAI"),
	Bullet = require("./Bullet"),
	BulletManager = require("./BulletManager"),
	server,
	socket,
	//rk4 = require("./RK4").init(),
	euler = require("./Euler").init(),
	aiPlayers = [], // Should prob move this into it's own class that manages players
	maxAiPlayers = 1,
	players = [], // Should prob move this into it's own class that manages players
	bullets = BulletManager.init(),
	currentTime = Date.now(), // Current time in ms, used to calculate frame time
	runUpdate = true,

	// Game world
	worldWidth = 1500,
	worldHeight = 600,
	
	// Message queues
	msgOutQueue = [],
	
	// Message types
	MESSAGE_TYPE_PING = 1,
	MESSAGE_TYPE_SYNC = 2,
	MESSAGE_TYPE_SYNC_COMPLETED = 3,
	MESSAGE_TYPE_NEW_PLAYER = 4,
	MESSAGE_TYPE_UPDATE_PLAYER = 5,
	MESSAGE_TYPE_UPDATE_INPUT = 6,
	MESSAGE_TYPE_REMOVE_PLAYER = 7,
	MESSAGE_TYPE_NEW_BULLET = 8,
	MESSAGE_TYPE_UPDATE_BULLET = 9,
	MESSAGE_TYPE_REMOVE_BULLET = 10,
	MESSAGE_TYPE_UPDATE_PLAYER_SCREEN = 11;


/**************************************************
** GAME INITIALISATION
**************************************************/

function init() {
	// Set up AI entities
	var i, x, y, playerAi;
	for (i = 0; i < maxAiPlayers; i++) {
		x = Math.round(Math.random()*worldWidth);
		y = Math.round(Math.random()*worldHeight);

		// Need to cut down the ID
		playerAi = PlayerAI.init("ai"+Date.now().toString()+Math.round(Math.random()*99).toString()+Math.round(Math.random()*99).toString(), "AI-"+Math.round(Math.random()*10), x, y);
		aiPlayers.push(playerAi);
	};

	// Set up socket server
	initSocket();
};


/**************************************************
** SET UP SOCKET SERVER
**************************************************/

function initSocket() {
	io.configure(function() {
		io.set("transports", ["websocket"]);
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
		client.on("game message", function(msg) {
			//sys.puts("Message id "+msg.z+" received at "+Date.now());

			if (msg.z !== undefined) {
				switch (msg.z) {
					case MESSAGE_TYPE_PING:
						var time = Date.now();
						client.emit("game message", formatMessage(MESSAGE_TYPE_PING, {t: time.toString(), ps: msg.ps}));
						sys.puts("Message id "+MESSAGE_TYPE_PING+" sent at "+time.toString());
						break;
					case MESSAGE_TYPE_SYNC:
						if (!msg.sc) {
							console.log("No screen dimensions sent for player "+client.id);
							return;
						}

						// Create new player
						var localPlayer = Player.init({id: client.id, name: "Human", x: 750, y: 300, screen: msg.sc});
			
						// Send new player to other clients
						client.broadcast.emit("game message", formatMessage(MESSAGE_TYPE_NEW_PLAYER, {id: localPlayer.id, n: localPlayer.name, c: localPlayer.colour, t: currentTime.toString(), s: localPlayer.getState()}));
						
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

							// Need to queue these messages if the client isn't fully synced up and ready yet
							client.emit("game message", formatMessage(MESSAGE_TYPE_NEW_PLAYER, {id: player.id, n: player.name, c: player.colour, t: currentTime.toString(), s: player.getState()}));
						};

						var aiPlayerCount = aiPlayers.length;
						for (p = 0; p < aiPlayerCount; p++) {
							aiPlayer = aiPlayers[p];

							if (!aiPlayer) {
								continue;
							};

							// Need to queue these messages if the client isn't fully synced up and ready yet
							client.emit("game message", formatMessage(MESSAGE_TYPE_NEW_PLAYER, {id: aiPlayer.player.id, n: aiPlayer.player.name, c: aiPlayer.player.colour, t: currentTime.toString(), s: aiPlayer.player.getState()}));
						}

						// Add new player
						players.push(localPlayer);

						console.log("New player added to game: ", client.id, currentTime);
						console.log("Total players now in game: ", players.length);
						
						// Sync complete
						// Should this wait until client has confirmed sync is complete?
						client.emit("game message", formatMessage(MESSAGE_TYPE_SYNC_COMPLETED, {}));
						break;
					case MESSAGE_TYPE_UPDATE_INPUT:
						var player = playerById(client.id);
						if (player && msg.i) {
							player.updateInput(msg.i);
						};
						break;
					case MESSAGE_TYPE_UPDATE_PLAYER_SCREEN:
						var player = playerById(client.id);
						if (player && msg.w && msg.h) {
							player.screen.w = msg.w;
							player.screen.h = msg.h;
						};
						break;
				};
			};
		});
	});	
};


/**************************************************
** GAME LOOP
**************************************************/

function update() {
	var newTime = Date.now(),
		frameTime = (newTime - currentTime)/1000, // Convert from ms to seconds
		player,
		playerCount = players.length,
		aiPlayer,
		aiPlayerCount = aiPlayers.length,
		i;
	
	// Limit frame time to avoid "spiral of death"
	// Document what is meant by "spiral of death", and what 0.25 means
	// if (frameTime > 0.25) {
	// 	console.log("Frametime pegged at 0.25");
	// 	frameTime = 0.25;
	// };
	
	// Update game time
	currentTime = newTime;
	
	// Update player states
	for (i = 0; i < playerCount; i++) {
		player = players[i];
		
		if (!player) {
			continue;
		};
		
		// Skip entity if there is no user input and the state hasn't changed
		// For now just update every entity all the time
	
		// Else update the state and continue the physics simulation
		player.updateState();
	};

	// Update AI player states
	for (i = 0; i < aiPlayerCount; i++) {
		aiPlayer = aiPlayers[i];
		
		if (!aiPlayer) {
			continue;
		};
		
		aiPlayer.update(players, aiPlayers, worldWidth, worldHeight);
		aiPlayer.player.updateState();
	};

	// Update bullet states
	bullets.updateState();

	// Run Euler simulation
	// For human players
	for (i = 0; i < playerCount; i++) {
		player = players[i];
		
		if (!player) {
			continue;
		}
		
		euler.integrate(player.currentState, frameTime);
	}

	// For AI players
	for (i = 0; i < aiPlayerCount; i++) {
		aiPlayer = aiPlayers[i];
		
		if (!aiPlayer) {
			continue;
		}
		
		// Skip update if the entity is still
		euler.integrate(aiPlayer.player.currentState, frameTime);
	}

	// Update bullets
	bullets.update(euler, frameTime);

	// Check for bullet collisions
	bullets.collisionAI(aiPlayers, msgOutQueue); // AI always die first
	bullets.collision(players, msgOutQueue);
	
	// Start loop through all game entities

	// Human players
	for (i = 0; i < playerCount; i++) {
		player = players[i];
		
		if (!player) {
			continue;
		};

		// Should this be done by events?
		if (player.getInput().fire == 1 && Date.now() - player.bulletTime > 400+Math.round(Math.random()*300)) {
			var bulletPos = Vector.init();
			bulletPos.x = player.currentState.p.x+(Math.cos(player.currentState.a)*7);
			bulletPos.y = player.currentState.p.y+(Math.sin(player.currentState.a)*7);

			// Need to cut down the ID
			bullets.add("bullet"+Date.now()+player.id, player.id, bulletPos.x, bulletPos.y, player.currentState.a, msgOutQueue);
			player.bulletTime = Date.now();
		}

		playerWithinUpdate(player);
		
		if (player.getState() && player.getInput() && player.hasChanged()) {
			// Slim update for no client-side prediction
			msgOutQueue.push({msg: formatMessage(MESSAGE_TYPE_UPDATE_PLAYER, {id: player.id, s: player.getState(true)})});
		}
	}

	// AI players
	for (i = 0; i < aiPlayerCount; i++) {
		aiPlayer = aiPlayers[i];
			
		if (!aiPlayer) {
			continue;
		}

		// Should this be done by events?
		if (aiPlayer.player.getInput().fire == 1 && Date.now() - aiPlayer.player.bulletTime > 400+Math.round(Math.random()*300)) {
			var bulletPos = Vector.init();
			bulletPos.x = aiPlayer.player.currentState.p.x+(Math.cos(aiPlayer.player.currentState.a)*7);
			bulletPos.y = aiPlayer.player.currentState.p.y+(Math.sin(aiPlayer.player.currentState.a)*7);

			// Need to cut down the ID
			bullets.add("bullet"+Date.now()+aiPlayer.player.id, aiPlayer.player.id, bulletPos.x, bulletPos.y, aiPlayer.player.currentState.a, msgOutQueue);
			aiPlayer.player.bulletTime = Date.now();
		}

		playerWithinUpdate(aiPlayer.player);
		
		if (aiPlayer.player.getState() && aiPlayer.player.getInput() && aiPlayer.player.hasChanged()) {
			msgOutQueue.push({msg: formatMessage(MESSAGE_TYPE_UPDATE_PLAYER, {id: aiPlayer.player.id, s: aiPlayer.player.getState(true)})});
		}
	}

	// End loop through all game entities
	
	// Collision detection can be performed at this point
	
	// Send updates to clients
	// Deal with queued outgoing messages
	unqueueOutgoingMessages(msgOutQueue);
	
	// Clear outgoing messages queue
	msgOutQueue = [];
	
	// Schedule next loop
	if (runUpdate) {
		setTimeout(update, 1000/60);
	}
}

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
	}

	return msg;
}

/**************************************************
** MESSAGE QUEUES
**************************************************/

// Unqueue outgoing messages and do stuff with them
function unqueueOutgoingMessages(msgQueue) {
	// Check for messages
	if (msgQueue.length === 0) {
		return;
	}
	
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
					// Only send update to players who can see this player
					var clients = io.sockets.clients(),
						player,
						clientCount = clients.length,
						playerX,
						playerY,
						halfScreenWidth,
						halfScreenHeight,
						i;

					for (i = 0; i < clientCount; i++) {
						client = clients[i];

						if (!client) {
							continue;
						}

						player = playerById(client.id);

						if (!player) {
							continue;
						}

						playerX = player.currentState.p.x;
						playerY = player.currentState.p.y;

						halfScreenWidth = 200 + player.screen.w/2;
						halfScreenHeight = 200 + player.screen.h/2;

						if (msg.s.p.x > playerX - halfScreenWidth && 
							msg.s.p.x < playerX + halfScreenWidth &&
							msg.s.p.y > playerY - halfScreenHeight &&
							msg.s.p.y < playerY + halfScreenHeight) {
							client.emit("game message", msg);
						}
					}
					break;
				case MESSAGE_TYPE_NEW_BULLET:
				case MESSAGE_TYPE_UPDATE_BULLET:
				case MESSAGE_TYPE_REMOVE_BULLET:
					io.sockets.emit("game message", msg);
					break;
			};
			//sys.puts("Message id "+msg.z+" sent at "+new Date().getTime().toString());
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

/**************************************************
** GAME WORLD HELPERS
**************************************************/

// World boundary checks
// Move to a viewport or world class?
function withinWorldBounds(x, y) {
	if (x > 0 && 
		x < worldWidth &&
		y > 0 &&
		y < worldHeight) {
		return true;	
	}
	
	return false;
};

function playerWithinUpdate(player) {
	var currentState = player.currentState;
	if (!withinWorldBounds(currentState.p.x, currentState.p.y)) {
		if (currentState.p.x > worldWidth) {
			currentState.p.x = worldWidth;
			currentState.v.x = 0;
		};

		if (currentState.p.x < 0) {
			currentState.p.x = 0;
			currentState.v.x = 0;
		};

		if (currentState.p.y > worldHeight) {
			currentState.p.y = worldHeight;
			currentState.v.y = 0;
		};

		if (currentState.p.y < 0) {
			currentState.p.y = 0;
			currentState.v.y = 0;
		};
	};	
};