/**************************************************
** GAME CONTROLLER
**************************************************/

// Main controller to set up the game (in the current sector?)
// Using a mixture of the Module and Mediator patterns (pg. 97 & 167
// in JavaScript Patterns); it knows about other objects, but they
// don't know each other.

r.namespace("Game");
rawkets.Game = function() {
	// Shortcuts
	var e = r.Event;
	
	/**************************************************
	** PROPERTIES
	**************************************************/
	
	// Networking
	var socket,
		message,
		
	// Game time
		clock,
		currentTime,
		
	// Game loop
		runUpdate,
		
	// Physics
		//rk4,
		
	// Viewport & graphics
		viewport,
		stars,
		
	// Local entities
		localPlayer,
		controls,
		previousInput,
		
	// Remote entities
		players,

	// Bullets: move to a manager class at some point
		bullets,

	// Netgraph
		net;
	
	/**************************************************
	** EVENT HANDLERS
	**************************************************/
	
	var setEventHandlers = function() {
		e.listen("SOCKET_CONNECTED", onSocketConnected);
		e.listen("CLOCK_READY", onClockReady);
		
		e.listen("SYNC_COMPLETED", onSyncCompleted);

		e.listen("NEW_PLAYER", onNewPlayer);
		e.listen("UPDATE_PLAYER", onUpdatePlayer);
		e.listen("REMOVE_PLAYER", onRemovePlayer);

		e.listen("NEW_BULLET", onNewBullet);
		e.listen("UPDATE_BULLET", onUpdateBullet);
		e.listen("REMOVE_BULLET", onRemoveBullet);
		
		window.addEventListener("resize", onResize, false);
	};
	
	var onSocketConnected = function() {
		message = new r.Message(socket);
		message.setEventHandlers();
		
		clock = new r.Clock(message);
		clock.start();
	};
	
	var onClockReady = function(latency) {
		console.log("Clock ready", latency+"ms");
		currentTime = clock.time();
		startGame();
	};
	
	// Run after initial sync with server is complete
	var onSyncCompleted = function() {
		// Start game loop
		runUpdate = true;
		updateGame();
	};
	
	var onNewPlayer = function(msg) {
		var args = msg.args;

		if (!args.id) {
			console.log("Failed to add new player", args.id);
		}

		var player = new r.Player({id: args.id, name: args.name, x: args.x, y: args.y, a: args.angle, h: args.health, f: args.force, c: args.colour});

		players.push(player);
		console.log("Added new player", player.id);
	};

	var onUpdatePlayer = function(msg) {
		var args = msg.args,
			state = new r.State({x: args.x, y: args.y, a: args.angle, h: args.health, f: args.force});

		if (localPlayer && args.id == localPlayer.id) {
			localPlayer.setState(state);
		} else if (players) {
			var player = playerById(args.id);
			if (!player) {
				return;
			}
			player.setTargetState(state);
		}
	};
	
	var onRemovePlayer = function(msg) {
		var args = msg.args,
			player = playerById(args.id);
		if (!player) {
			return;
		}
		console.log("Remove player: ", args.id);
		players.splice(indexOfByPlayerId(args.id), 1);
	};

	var onNewBullet = function(msg) {
		if (!bullets) {
			return;
		}

		var args = msg.args;

		if (!args.id) {
			console.log("Failed to add new bullet", args.id);
		}
		
		var bullet = new r.Bullet(args.id, args.x, args.y, args.angle);
		bullets.push(bullet);
	};

	var onUpdateBullet = function(msg) {
		if (!bullets) {
			return;
		}

		var args = msg.args,
			bulletCount = bullets.length,
			bullet,
			bulletState,
			i;

		// Find bullet by ID (move into a bullet manager class)
		for (i = 0; i < bulletCount; i++) {
			bullet = bullets[i];

			if (bullet.id == args.id) {
				bulletState = new r.State({x: args.x, y: args.y, a: bullet.currentState.a});
				bullet.setTargetState(bulletState);
				return;
			}
		}
	};
	
	var onRemoveBullet = function(msg) {
		if (!bullets) {
			return;
		}

		// Find bullet by ID (move into a bullet manager class)
		var args = msg.args,
			bulletCount = bullets.length,
			bullet,
			i;

		for (i = 0; i < bulletCount; i++) {
			bullet = bullets[i];

			if (bullet.id == args.id) {
				bullets.splice(bullets.indexOf(bullet), 1);
				return;
			}
		}
	};
	
	function onKeydown(e) {
		if (!runUpdate) {
			return;
		}

		if (localPlayer) {
			controls.getKeyboard().onKeyDown(e);
		}
	}

	function onKeyup(e) {
		if (!runUpdate) {
			return;
		}

		if (localPlayer) {
			controls.getKeyboard().onKeyUp(e);
		}
	}
	
	function onResize(e) {
		if (!viewport) {
			return;
		}
		
		viewport.onResize(e);
		message.send(message.encode([message.typeIndexes.updatePlayerScreen, viewport.dimensions.width, viewport.dimensions.height]), true);
	}
	
	/**************************************************
	** FINDING PLAYERS
	**************************************************/

	// Find player by ID
	function playerById(id) {
		for (var i = 0; i < players.length; i++) {
			if (players[i].id == id)
				return players[i];
		}

		return false;
	}

	// Find player index by ID
	function indexOfByPlayerId(id) {
		for (var i = 0; i < players.length; i++) {
			if (players[i].id == id) {
				return i;
			}
		}

		return false;
	}
	
	/**************************************************
	** START GAME
	**************************************************/
	
	var startGame = function() {
		var canvas = document.getElementById("canvas");
		if (!canvas) {
			console.log("Game canvas is unavailable", canvas);
		}
		
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight-111;

		viewport = new r.Viewport(canvas, canvas.width, canvas.height, 1500, 600);
		viewport.initStars();
			
		localPlayer = new r.Player({id: socket.getSessionId(), name: "You", x: 750, y: 300}); // Should be getting start pos from server
		
		if (!localPlayer) {
			console.log("Failed to create local player", localPlayer);
			return;
		}
		
		console.log("Local player id", localPlayer.id);
		
		//rk4 = new r.RK4();
		
		controls = new r.Controls();

		// Keyboard
		controls.addKeyboard(new r.Keyboard());
		window.addEventListener("keydown", onKeydown, false);
		window.addEventListener("keyup", onKeyup, false);

		// Gamepad - Mozilla
		window.addEventListener("MozGamepadConnected", function(e) {
			if (controls.getGamepad()) {
				return;
			}

			controls.addGamepad(new Input.Device(e.gamepad));
			console.log("Gamepad connected", e.gamepad.id);
		});
		
		players = [];
		bullets = [];

		//net = new r.NetGraph(canvas.width, 50);
		//net.init();
		
		//message.send(message.format("SYNC", {sc: {w: viewport.dimensions.width+50, h: viewport.dimensions.height+50}}), true);
		message.send(message.encode([message.typeIndexes.sync, viewport.dimensions.width+50, viewport.dimensions.height+50]), true);
	};
	
	/**************************************************
	** UPDATE GAME
	**************************************************/
	
	var updateGame = function(timestamp) {
		// Gamepad - Webkit
		if (navigator.webkitGamepads && navigator.webkitGamepads[0] && !controls.getGamepad()) {
			controls.addGamepad(new Input.Device(navigator.webkitGamepads[0]));
			console.log("Gamepad connected", navigator.webkitGamepads[0].id);
		}

		// Calculate input based on controls
		var input = controls.updateInput(localPlayer.currentState.a);

		// Update input
		localPlayer.updateInput(input);

		// Only send input if it has changed (saves bandwidth)
		var previousInput = localPlayer.getPreviousInput();
		if (!previousInput || input.forward != previousInput.forward || input.rotation != previousInput.rotation || input.fire != previousInput.fire) {
			//console.log("Input updated", currentTime, localPlayer.getInput(), Date.now());
			message.send(message.encode([message.typeIndexes.updateInput, input.forward, input.rotation, input.fire]), true);
		}

		viewport.update(localPlayer.currentState.p.x, localPlayer.currentState.p.y);

		// Update remote players (move to a manager class)
		var p, playerCount = players.length, player;
		for (p = 0; p < playerCount; p++) {
			player = players[p];

			if (!player) {
				continue;
			}

			player.update();
		}

		// Update bullets
		var b, bulletCount = bullets.length, bullet;
		for (b = 0; b < bulletCount; b++) {
			bullet = bullets[b];

			if (!bullet) {
				continue;
			}

			bullet.update();
		}
		
		//net.updateData();

		drawGame();

		// Schedule next game update
		if (runUpdate) {
			window.requestAnimFrame(updateGame);
		}
	};
	
	/**************************************************
	** UPDATE GAME
	**************************************************/
	
	function drawGame() {
		viewport.draw();
		localPlayer.draw(viewport);

		// Draw remote players (move to a manager class)
		var p, playerCount = players.length, player;
		for (p = 0; p < playerCount; p++) {
			player = players[p];

			if (!player) {
				continue;
			}

			player.draw(viewport);
		}

		// Draw bullets (move to a manager class)
		var b, bulletCount = bullets.length, bullet;
		for (b = 0; b < bulletCount; b++) {
			bullet = bullets[b];

			if (!bullet) {
				continue;
			}

			bullet.draw(viewport);
		}
		
		// Draw netgraph
		//net.draw(viewport);
	}
	
	/**************************************************
	** INITIALISE GAME
	**************************************************/
	
	var init = function(canvas) {
		runUpdate = false;
		
		setEventHandlers();
			
		// At some point...
		socket = new r.Socket("localhost", 8000);
		socket.connect();
		
		return this;
	};
	
	return {
		init: init
	};
};