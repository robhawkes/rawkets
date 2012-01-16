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
		if (!msg.id || !msg.s) {
			console.log("Failed to add new player", msg.id);
		};

		var player = new r.Player({id: msg.id, name: msg.n, x: msg.s.p.x, y: msg.s.p.y, a: msg.s.a, f: msg.s.f, h: msg.s.h});
		if (msg.c) {
			player.setColour(msg.c);
		};

		players.push(player);
		console.log("Added new player", player.id);
	};

	var onUpdatePlayer = function(msg) {
		if (localPlayer && msg.id == localPlayer.id) {
			localPlayer.setState(msg.s);
		} else if (players) {
			var player = playerById(msg.id);
			if (!player) {
				return;
			};
			player.setTargetState(msg.s);
		};
	};
	
	var onRemovePlayer = function(msg) {
		var player = playerById(msg.id);
		if (!player) {
			return;
		};
		console.log("Remove player: ", msg.id);
		players.splice(indexOfByPlayerId(msg.id), 1);
	};

	var onNewBullet = function(msg) {
		if (!bullets) {
			return;
		};

		if (!msg.id || !msg.s) {
			console.log("Failed to add new bullet", msg.id);
		};
		
		var bullet = new r.Bullet(msg.id, msg.s.p.x, msg.s.p.y, msg.s.a, msg.s.f);
		bullets.push(bullet);
		
		//console.log("Added new bullet", msg.id);
	};

	var onUpdateBullet = function(msg) {
		if (!bullets) {
			return;
		};

		// Find bullet by ID (move into a bullet manager class)
		var bulletCount = bullets.length,
			bullet,
			i;

		for (i = 0; i < bulletCount; i++) {
			bullet = bullets[i];

			if (bullet.id == msg.id) {
				bullet.updateState();
				bullet.setState(msg.s);
				return;
			};
		};
	};
	
	var onRemoveBullet = function(msg) {
		if (!bullets) {
			return;
		};

		// Find bullet by ID (move into a bullet manager class)
		var bulletCount = bullets.length,
			bullet,
			i;

		for (i = 0; i < bulletCount; i++) {
			bullet = bullets[i];

			if (bullet.id == msg.id) {
				bullets.splice(bullets.indexOf(bullet), 1);
				//console.log("Removed bullet", msg.id);
				return;
			};
		};
	};
	
	function onKeydown(e) {
		if (!runUpdate) {
			return;
		};

		if (localPlayer) {
			controls.getKeyboard().onKeyDown(e);
		};
	};

	function onKeyup(e) {
		if (!runUpdate) {
			return;
		};

		if (localPlayer) {
			controls.getKeyboard().onKeyUp(e);
		};
	};
	
	function onResize(e) {
		if (!viewport) {
			return;
		}
		
		viewport.onResize(e);

		message.send(message.format("UPDATE_PLAYER_SCREEN", {w: viewport.dimensions.width, h: viewport.dimensions.height}), true);
	}
	
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
	** START GAME
	**************************************************/
	
	var startGame = function() {
		var canvas = document.getElementById("canvas");
		if (!canvas) {
			console.log("Game canvas is unavailable", canvas);
		};
		
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight-111;

		viewport = new r.Viewport(canvas, canvas.width, canvas.height, 1500, 600);
		viewport.initStars();
			
		localPlayer = new r.Player({id: socket.getSessionId(), name: "You", x: 750, y: 300}); // Should be getting start pos from server
		
		if (!localPlayer) {
			console.log("Failed to create local player", localPlayer);
			return;
		};
		
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
		
		message.send(message.format("SYNC", {sc: {w: viewport.dimensions.width+50, h: viewport.dimensions.height+50}}), true);
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
			message.send(message.format("UPDATE_INPUT", {t: currentTime.toString(), i: localPlayer.getInput()}), true);
		};

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
		
		//net.updateData();

		drawGame();

		// Schedule next game update
		if (runUpdate) {
			window.requestAnimFrame(updateGame);
		};
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
			};

			player.draw(viewport);
		};

		// Draw bullets (move to a manager class)
		var b, bulletCount = bullets.length, bullet;
		for (b = 0; b < bulletCount; b++) {
			bullet = bullets[b];

			if (!bullet) {
				continue;
			};

			bullet.draw(viewport);
		};
		
		// Draw netgraph
		//net.draw(viewport);
	};
	
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