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
	var e = r.Event,
		ps = r.ProfilerSession;
	
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
		currentInput,
		previousInput,
		//history,
		
	// Remote entities
		players,

	// Bullets – move to a manager class at some point
		bullets,

	// Netgraph
		net,

	// Profiler
		profiler;
	
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

		var player = new r.Player(msg.id, msg.n, msg.s.p.x, msg.s.p.y, msg.s.a, msg.s.f, msg.s.h);
		if (msg.c) {
			player.setColour(msg.c);
		};

		players.push(player);
		console.log("Added new player", player.id);
	};

	var onUpdatePlayer = function(msg) {
		if (localPlayer && msg.id == localPlayer.id) {
			// If required, perform correction on client-side prediction
			//history.correction(msg.t, msg.s, msg.i, localPlayer, rk4);

			// No client-side prediction for now
			localPlayer.setState(msg.s);
		} else if (players) {
			var player = playerById(msg.id);
			if (!player) {
				return;
			};
			//player.correctState(msg.t, msg.s);
			// No client-side prediction for now
			player.setState(msg.s);
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
		};
		
		viewport.onResize(e);
		
		// var msg = formatMessage(MESSAGE_TYPE_UPDATE_PLAYER_SCREEN, {
		// 	w: viewport.dimensions.width+50,
		// 	h: viewport.dimensions.height+50
		// });
		// socket.send(msg);
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
			
		localPlayer = new r.Player(socket.getSessionId(), "You", 750, 300); // Should be getting start pos from server
		
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

		// Gamepad
		window.addEventListener("MozGamepadConnected", function(e) {
			controls.addGamepad(new Input.Device(e.gamepad));
			console.log("Gamepad connected", gamepad.id);
		});
		
		//history = new r.History();
		
		players = [];
		bullets = [];

		net = new r.NetGraph(canvas.width, 50);
		net.init();
		
		message.send(message.format("SYNC", {}), true);
	};
	
	/**************************************************
	** UPDATE GAME
	**************************************************/
	
	// var localTest = false,
	// 	localCount = 0;
	var updateGame = function(timestamp) {
		var profilerSession = ps.createSession();
		e.fire("PROFILER_START_BENCHMARK", {id: profilerSession, time: Date.now(), type: 0, colour: "#222"});
		// var newTime = clock.time(),
		// var newTime = Date.now(),
		// 	frameTime = (newTime - currentTime)/1000; // Convert from ms to seconds

		// // Limit frame time to avoid "spiral of death"
		// if (frameTime > 0.25) {
		// 	console.log("Frametime pegged at 0.25");
		// 	frameTime = 0.25;
		// };

		// // Update game time
		// currentTime = newTime;
		
		// if (!localTest && localPlayer) {
		// 	console.log("Start player: "+currentTime, localPlayer.currentState.p.x, localPlayer.currentState.p.y, localPlayer.currentState.v.x, localPlayer.currentState.v.y, localPlayer.currentState.f, localPlayer.currentState.a);
		// 	localTest = true;
		// };

		// Calculate input based on controls
		var input = controls.updateInput(localPlayer.currentState.a);

		// Update input
		localPlayer.updateInput(input);

		// Only send input if it has changed (saves bandwidth)
		var previousInput = localPlayer.getPreviousInput();
		if (!previousInput || input.forward != previousInput.forward || input.rotation != previousInput.rotation) {
			//console.log("Input updated", currentTime, localPlayer.getInput(), Date.now());
			message.send(message.format("UPDATE_INPUT", {t: currentTime.toString(), i: localPlayer.getInput()}), true);
		};

		// (function() {
		// 	var profilerSession = ps.createSession();
		// 	e.fire("PROFILER_START_BENCHMARK", {id: profilerSession, time: Date.now(), type: 3, colour: "#00ff00"});		
		// 	// Skip entity if the state hasn't changed
		// 	// For now just update entity all the time
		// 	// Else update the state
		// 	localPlayer.updateState();
		// 	e.fire("PROFILER_STOP_BENCHMARK", {id: profilerSession, time: Date.now(), type: 3});
		// })();

		viewport.update(localPlayer.currentState.p.x, localPlayer.currentState.p.y);

		// (function() {
		// 	var profilerSession = ps.createSession();
		// 	e.fire("PROFILER_START_BENCHMARK", {id: profilerSession, time: Date.now(), type: 3, colour: "#00ff00"});
		// 	for (p = 0; p < playerCount; p++) {
		// 		player = players[p];

		// 		if (!player) {
		// 			continue;
		// 		};

		// 		// Skip entity if the state hasn't changed
		// 		// For now just update entity all the time
		// 		player.updateState(currentTime);
		// 	};

		// 	e.fire("PROFILER_STOP_BENCHMARK", {id: profilerSession, time: Date.now(), type: 3});
		// })();

		// var playerCount = players.length;
		
		// (function() {
		// 	var profilerSession = ps.createSession();
		// 	e.fire("PROFILER_START_BENCHMARK", {id: profilerSession, time: Date.now(), type: 1, colour: "#0000ff"});

		// 	// Run RK4 simulation
		// 	rk4.accumulator += frameTime;
		// 	while (rk4.accumulator >= rk4.dt) {
		// 		if (localPlayer) {
		// 			// Skip update if the localPlaer entity is still
		// 			rk4.integrate(localPlayer.currentState);
		// 		};

		// 		for (p = 0; p < playerCount; p++) {
		// 			player = players[p];

		// 			if (!player) {
		// 				continue;
		// 			};

		// 			// Skip update if the player entity is still
		// 			rk4.integrate(player.currentState);
		// 		};

		// 		// Increase simulation time
		// 		//rk4.t += rk4.dt;

		// 		// Update accumulator
		// 		rk4.accumulator -= Math.abs(rk4.dt); // Absolute value to allow for reverse time
		// 	};

		// 	e.fire("PROFILER_STOP_BENCHMARK", {id: profilerSession, time: Date.now(), type: 1});
		// })();
		
		// Find leftover time due to incomplete physics time delta
		// Why have I disabled this? Document or remove.
		//var alpha = rk4.accumulator / Math.abs(rk4.dt);  // Absolute value to allow for reverse time
		
		// Store movement in buffer (each frame for super-fine detail when calculating fixes)
		// var move = new r.Move(currentTime, localPlayer.getInput(), localPlayer.getState());
		// history.add(move);

		// Interpolate state considering incomplete physics time delta (accumulator)
		// Why have I disabled this? Document or remove.
		// localPlayer.interpolate(alpha);
		
		net.updateData();

		drawGame();

		e.fire("PROFILER_STOP_BENCHMARK", {id: profilerSession, time: Date.now(), type: 0});
		
		// Schedule next game update
		if (runUpdate) {
			window.requestAnimFrame(updateGame);
		};
	};
	
	/**************************************************
	** UPDATE GAME
	**************************************************/
	
	function drawGame() {
		var profilerSession = ps.createSession();
		e.fire("PROFILER_START_BENCHMARK", {id: profilerSession, time: Date.now(), type: 5, colour: "#c61ad1"});

		viewport.draw();
		localPlayer.draw(viewport);

		// Start Gamepad API testing
		var gamepad;
		if (gamepad = controls.getGamepad()) {
			var screenPos = viewport.worldToScreen(localPlayer.currentState.p.x, localPlayer.currentState.p.y);
			viewport.ctx.save();
			viewport.ctx.strokeStyle = "green";
			viewport.ctx.lineWidth = 3;
			viewport.ctx.beginPath();
			viewport.ctx.moveTo(screenPos.x, screenPos.y);
			viewport.ctx.lineTo(screenPos.x+gamepad.axes.Left_Stick_X*100, screenPos.y+gamepad.axes.Left_Stick_Y*100);
			viewport.ctx.stroke();
			viewport.ctx.restore();
		};
		// End Gamepad API

		// Draw remote players – move to a manager class
		var p, playerCount = players.length, player;
		for (p = 0; p < playerCount; p++) {
			player = players[p];

			if (!player) {
				continue;
			};

			player.draw(viewport);
		};

		// Draw bullets – move to a manager class
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

		e.fire("PROFILER_STOP_BENCHMARK", {id: profilerSession, time: Date.now(), type: 5});
	};
	
	/**************************************************
	** INITIALISE GAME
	**************************************************/
	
	var init = function(canvas) {
		//profiler = new r.Profiler();
		//profiler.init();

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