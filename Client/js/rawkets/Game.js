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
	
	// Properties
	
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
		
	// Local entities
		localPlayer,
		keys,
		currentInput,
		previousInput,
		history,
		
	// Remote entities
		players;
	
	// Methods
	var setEventHandlers = function() {
		e.listen("SOCKET_CONNECTED", onSocketConnected);
		e.listen("CLOCK_READY", onClockReady);
		
		e.listen("SYNC", onSync);
		e.listen("NEW_PLAYER", onNewPlayer);
		e.listen("UPDATE_PLAYER", onUpdatePlayer);
		
		window.addEventListener("keydown", onKeydown, false);
		window.addEventListener("keyup", onKeyup, false);
	};
	
	// Event handlers
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
	
	var onSync = function() {
		// Start game loop
		console.log("Starting game update");
		runUpdate = true;
		update();
	};
	
	var onNewPlayer = function(msg) {
		if (!msg.id || !msg.s) {
			console.log("Failed to add new player", msg.id, msg.s);
		};
		var player = new Player(msg.id, msg.s.p.x, msg.s.p.y, msg.s.v, msg.s.f, msg.s.a);
		players.push(player);
		console.log("Added new player", player);
	};
	
	var onUpdatePlayer = function(msg) {
		if (localPlayer && msg.id == localPlayer.id) {
			//console.log("Update local");
			//document.getElementById("outputServer").innerHTML = "localPlayer server: ["+msg.s.p.x+", "+msg.s.p.y+"], ["+msg.s.v.x+", "+msg.s.v.y+"], "+msg.s.f+", "+msg.s.a;
			// If required, perform correction on client-side prediction
			rhistory.correction(msg.t, msg.s, msg.i, localPlayer, rk4);
		} else {
			//document.getElementById("outputServerRemote").innerHTML = "remotePlayer server: ["+msg.s.p.x+", "+msg.s.p.y+"], ["+msg.s.v.x+", "+msg.s.v.y+"], "+msg.s.f+", "+msg.s.a;
			var player = playerById(msg.id);
			if (player) {
				player.correctState(msg.t, msg.s);
			};
		};
	};
	
	function onKeydown(e) {
		var c = e.keyCode;

		if (!runUpdate) {
			return;
		};

		if (localPlayer) {
			switch (c) {
				// Controls
				case 37: // Left
					keys.left = true;
					break;
				case 38: // Up
					keys.up = true;
					break;
				case 39: // Right
					keys.right = true; // Will take priority over the left key
					break;
			};
		};
	};

	function onKeyup(e) {
		var c = e.keyCode;

		if (!runUpdate) {
			return;
		};

		if (localPlayer) {
			switch (c) {
				case 37: // Left
					keys.left = false;
					break;
				case 38: // Up
					keys.up = false;
					break;
				case 39: // Right
					keys.right = false;
					break;
			};
		};

		//console.log("Key down [code: "+e.keyCode+"]");
	};
	
	// Start game
	var start = function() {		
		localPlayer = new r.Player(socket.getSessionId()); // Should be getting start pos from server
		
		if (!localPlayer) {
			console.log("Failed to create local player", localPlayer);
			return;
		};
		
		console.log("Local player id", localPlayer.id);
		
		rk4 = new r.RK4();
		
		keys = new r.Keys();
		history = new r.History();
		
		players = [];
		
		message.send(message.format("SYNC", {}), true);
	};
	
	// Update game
	var update = function() {
		var newTime = clock.time(),
			frameTime = (newTime - currentTime)/1000; // Convert from ms to seconds

		// Limit frame time to avoid "spiral of death"
		if (frameTime > 0.25) {
			frameTime = 0.25;
		};

		// Update game time
		currentTime = newTime;

		// Calculate new input based on keys
		var input = new r.Input((keys.up) ? 1 : 0, ((keys.left) ? -1 : 0 || (keys.right) ? 1 : 0));

		// Update input
		localPlayer.updateInput(input);
		
		// Store input in movement buffer (each frame for super-fine detail when calculating fixes)
		var move = new r.Move(currentTime, localPlayer.getInput(), localPlayer.getState());
		history.add(move);

		// Only send input if it has changed (saves bandwidth)	
		var previousInput = localPlayer.getPreviousInput();
		if (!previousInput || input.forward != previousInput.forward || input.rotation != previousInput.rotation) {
			//console.log(updateTime, currentInput.forward, currentInput.rotation);
			message.send(message.format("UPDATE_INPUT", {t: currentTime.toString(), i: localPlayer.getInput()}), true);
		};
		
		// Skip entity if the state hasn't changed
		// For now just update entity all the time
		// Else update the state
		localPlayer.updateState();

		for (p = 0; p < playerCount; p++) {
			player = players[p];

			if (!player) {
				continue;
			};

			// Skip entity if the state hasn't changed
			// For now just update entity all the time
			player.updateState(currentTime);
		};

		var playerCount = players.length;
		
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
		
		// Find leftover time due to incomplete physics time delta
		//var alpha = rk4.accumulator / Math.abs(rk4.dt);  // Absolute value to allow for reverse time

		// ONLY FOR CLIENT
		// Interpolate state considering incomplete physics time delta (accumulator)
		//localPlayer.interpolate(alpha);
		
		// Schedule next game update
		if (runUpdate) {
			setTimeout(update, 1000/60);
		};
	};
	
	// Initialisation
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