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
	
	var socket,
		message,
		clock;
	
	// Methods
	var setEventHandlers = function() {
		e.listen("SOCKET_CONNECTED", onSocketConnected);
	};
	
	// Event handlers
	var onSocketConnected = function() {
		message = new r.Message(socket);
		message.init(); // Set up event listeners
		
		clock = new r.Clock(message);
		clock.start();
	};
	
	// Initialisation
	var init = function(canvas) {
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