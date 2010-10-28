$(function() {
	// Firefox support
	//window.WEB_SOCKET_DEBUG = true;
	//window.WEB_SOCKET_SWF_LOCATION = "/experiments/rawkets/js/socket.io/lib/vendor/web-socket-js/WebSocketMain.swf";
	//io.setPath("/experiments/rawkets/js/socket.io/");

	var game;
	
	/**
	 * Initialises client-side functionality
	 */
	function init() {
		if ("WebSocket" in window) {
			// WebSockets supported
			game = new Game();
			
			$("#attribution, #ping").fadeTo(500, 0.3).mouseover(function() {
				$(this).stop().fadeTo(500, 1);
			}).mouseout(function() {
				$(this).stop().fadeTo(500, 0.3);
			});
			
			initListeners();
		} else {
			// WebSockets not supported
			$("#support").fadeIn();
		};
	};
	
	/**
	 * Initialises environmental event listeners
	 */	
	function initListeners() {
		$(window).bind("resize", {self: game}, game.resizeCanvas)
				 // Horrible passing of game object due to event closure
				 .bind("keydown", {self: game}, game.movePlayer)
				 .bind("keyup", {self: game}, game.haltPlayer);
		
		/*$(window).bind("mouseup", function(e) {
			game.socket.send(Game.formatMessage("testing", {x: 123, y: 456}));
		});*/
	};
	
	// Initialise client-side functionality
	init();
});