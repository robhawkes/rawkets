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
		rk4,
		
	// Viewport & graphics
		viewport,
		
	// Local entities
		localPlayer,
		keys,
		currentInput,
		previousInput,
		history,
		
	// Remote entities
		players,

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
		
		window.addEventListener("resize", onResize, false);
	};
	
	var onSocketConnected = function() {
		message = new r.Message(socket);
		message.setEventHandlers();
		
		clock = new r.Clock(message);
		clock.start();
	};
	
	var onClockReady = function() {
		currentTime = clock.time();
		
		// If all is well
		start();
	};
	
	// Run after initial sync with server is complete
	var onSyncCompleted = function() {
		// Start game loop
		//console.log("Starting game update", clock.time());
		runUpdate = true;
		update();
	};
	
	var onNewPlayer = function(msg) {
		if (!msg.id || !msg.s) {
			console.log("Failed to add new player", msg.id, msg.s);
		};
		var player = new r.Player(msg.id, msg.s.p.x, msg.s.p.y, msg.s.v, msg.s.f, msg.s.a);
		players.push(player);
		console.log("Added new player", player);
	};
	
	//var updateDebug = 0;
	var onUpdatePlayer = function(msg) {
		if (localPlayer && msg.id == localPlayer.id) {
			// if (updateDebug < 10) {
			// 	// There is at least a 20-100ms difference here. Why?
			// 	console.log(Date.now()-Number(msg.t));
			// 	updateDebug++;
			// };
			//console.log("Update local");
			//document.getElementById("outputServer").innerHTML = "localPlayer server: ["+msg.s.p.x+", "+msg.s.p.y+"], ["+msg.s.v.x+", "+msg.s.v.y+"], "+msg.s.f+", "+msg.s.a;
			// If required, perform correction on client-side prediction
			history.correction(msg.t, msg.s, msg.i, localPlayer, rk4);
		} else if (players) {
			//document.getElementById("outputServerRemote").innerHTML = "remotePlayer server: ["+msg.s.p.x+", "+msg.s.p.y+"], ["+msg.s.v.x+", "+msg.s.v.y+"], "+msg.s.f+", "+msg.s.a;
			// var player = playerById(msg.id);
			// if (!player) {
			// 	return;
			// };
			// player.correctState(msg.t, msg.s);
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
	
	function onKeydown(e) {
		if (!runUpdate) {
			return;
		};

		if (localPlayer) {
			keys.onKeyDown(e);
			debugInput();
		};
	};

	function onKeyup(e) {
		if (!runUpdate) {
			return;
		};

		if (localPlayer) {
			keys.onKeyUp(e);
			debugInput();
		};
	};

	// Debug function - remove
	function debugInput() {
		// Calculate new input based on keys
		var input = new r.Input((keys.up) ? 1 : 0, ((keys.left) ? -1 : 0 || (keys.right) ? 1 : 0));

		// Update input
		localPlayer.updateInput(input);

		// Only send input if it has changed (saves bandwidth)
		var previousInput = localPlayer.getPreviousInput();
		var inputTime = Date.now();
		if (!previousInput || input.forward != previousInput.forward || input.rotation != previousInput.rotation) {
			message.send(message.format("UPDATE_INPUT", {t: inputTime.toString(), i: localPlayer.getInput()}), true);
			console.log("Input updated", inputTime.toString(), localPlayer.getInput());
			//console.log(updateTime, currentInput.forward, currentInput.rotation);
		};
	};
	
	function onResize(e) {
		if (!viewport) {
			return;
		};
		
		viewport.onResize(e);
		
		/*
		if (stars != undefined) {
			var xRatio = canvas.width/starsOriginalWidth;
			var yRatio = canvas.height/starsOriginalHeight;

			var starCount = stars.length,
				star,
				s;
			for (s = 0; s < starCount; s++) {
				star = stars[s];

				if (star == null) {
					continue;
				};

				star.pos.x *= xRatio;
				star.pos.y *= yRatio;
			};

			starsOriginalWidth = canvas.width;
			starsOriginalHeight = canvas.height;
		};
		
		var msg = formatMessage(MESSAGE_TYPE_UPDATE_PLAYER_SCREEN, {
			w: viewport.dimensions.width+50,
			h: viewport.dimensions.height+50
		});
		socket.send(msg);
		*/
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
	
	var start = function() {
		var canvas = document.getElementById("canvas");
		if (!canvas) {
			console.log("Game canvas is unavailable", canvas);
		};
		
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight-111;
		viewport = new r.Viewport(canvas, canvas.width, canvas.height, 2000, 2000);
			
		localPlayer = new r.Player(socket.getSessionId(), 1000, 1000); // Should be getting start pos from server
		
		if (!localPlayer) {
			console.log("Failed to create local player", localPlayer);
			return;
		};
		
		console.log("Local player id", localPlayer.id);
		
		rk4 = new r.RK4();
		
		keys = new r.Keys();
		window.addEventListener("keydown", onKeydown, false);
		window.addEventListener("keyup", onKeyup, false);
		
		history = new r.History();
		
		players = [];
		
		message.send(message.format("SYNC", {}), true);
	};
	
	/**************************************************
	** UPDATE GAME
	**************************************************/
	
	// var localTest = false,
	// 	localCount = 0;
	var update = function(timestamp) {
		var profilerSession = ps.createSession();
		e.fire("PROFILER_START_BENCHMARK", {id: profilerSession, time: Date.now(), type: 0, colour: "#222"});
		//var newTime = clock.time(),
		var newTime = Date.now(),
			frameTime = (newTime - currentTime)/1000; // Convert from ms to seconds

		// Limit frame time to avoid "spiral of death"
		if (frameTime > 0.25) {
			console.log("Frametime pegged at 0.25");
			frameTime = 0.25;
		};

		// Update game time
		currentTime = newTime;
		
		// if (!localTest && localPlayer) {
		// 	console.log("Start player: "+currentTime, localPlayer.currentState.p.x, localPlayer.currentState.p.y, localPlayer.currentState.v.x, localPlayer.currentState.v.y, localPlayer.currentState.f, localPlayer.currentState.a);
		// 	localTest = true;
		// };

		/*// Calculate new input based on keys
		var input = new r.Input((keys.up) ? 1 : 0, ((keys.left) ? -1 : 0 || (keys.right) ? 1 : 0));

		// Update input
		localPlayer.updateInput(input);

		// Only send input if it has changed (saves bandwidth)
		// For now just send input all the time
		var previousInput = localPlayer.getPreviousInput();
		if (!previousInput || input.forward != previousInput.forward || input.rotation != previousInput.rotation) {
			//console.log(updateTime, currentInput.forward, currentInput.rotation);
			console.log("Input updated", currentTime, localPlayer.getInput(), Date.now());
			message.send(message.format("UPDATE_INPUT", {t: currentTime.toString(), i: localPlayer.getInput()}), true);
		};*/

		(function() {
			var profilerSession = ps.createSession();
			e.fire("PROFILER_START_BENCHMARK", {id: profilerSession, time: Date.now(), type: 3, colour: "#00ff00"});		
			// Skip entity if the state hasn't changed
			// For now just update entity all the time
			// Else update the state
			localPlayer.updateState();
			viewport.update(localPlayer.currentState.p.x, localPlayer.currentState.p.y);

			for (p = 0; p < playerCount; p++) {
				player = players[p];

				if (!player) {
					continue;
				};

				// Skip entity if the state hasn't changed
				// For now just update entity all the time
				player.updateState(currentTime);
			};

			e.fire("PROFILER_STOP_BENCHMARK", {id: profilerSession, time: Date.now(), type: 3});
		})();

		var playerCount = players.length;
		
		(function() {
			var profilerSession = ps.createSession();
			e.fire("PROFILER_START_BENCHMARK", {id: profilerSession, time: Date.now(), type: 1, colour: "#0000ff"});

			// Run RK4 simulation
			rk4.accumulator += frameTime;
			while (rk4.accumulator >= rk4.dt) {
				if (localPlayer) {
					// Skip update if the localPlaer entity is still
					rk4.integrate(localPlayer.currentState);
				};

				for (p = 0; p < playerCount; p++) {
					player = players[p];

					if (!player) {
						continue;
					};

					// Skip update if the player entity is still
					rk4.integrate(player.currentState);
				};

				// Increase simulation time
				//rk4.t += rk4.dt;

				// Update accumulator
				rk4.accumulator -= Math.abs(rk4.dt); // Absolute value to allow for reverse time
			};

			e.fire("PROFILER_STOP_BENCHMARK", {id: profilerSession, time: Date.now(), type: 1});
		})();
		
		// Find leftover time due to incomplete physics time delta
		//var alpha = rk4.accumulator / Math.abs(rk4.dt);  // Absolute value to allow for reverse time
		
		// if (localCount < 100) {
		// 	console.log(currentTime, localPlayer.getState());
		// 	localCount++;
		// };
		
		// Store movement in buffer (each frame for super-fine detail when calculating fixes)
		var move = new r.Move(currentTime, localPlayer.getInput(), localPlayer.getState());
		history.add(move);

		// ONLY FOR CLIENT
		// Interpolate state considering incomplete physics time delta (accumulator)
		//localPlayer.interpolate(alpha);
		
		draw();

		e.fire("PROFILER_STOP_BENCHMARK", {id: profilerSession, time: Date.now(), type: 0});
		
		// Schedule next game update
		// Need to change this to use requestAnimationFrame
		if (runUpdate) {
			setTimeout(update, 1000/60);
			//window.mozRequestAnimationFrame(update);
		};
	};
	
	/**************************************************
	** UPDATE GAME
	**************************************************/
	
	function draw() {
		var profilerSession = ps.createSession();
		e.fire("PROFILER_START_BENCHMARK", {id: profilerSession, time: Date.now(), type: 5, colour: "#c61ad1"});

		viewport.draw();
		localPlayer.draw(viewport);

		e.fire("PROFILER_STOP_BENCHMARK", {id: profilerSession, time: Date.now(), type: 5});
	};
	
	/**************************************************
	** INITIALISE GAME
	**************************************************/
	
	var init = function(canvas) {
		profiler = new r.Profiler();
		profiler.init();

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