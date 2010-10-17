$(function() {
	var game;
	
	/**
	 * Initialises client-side functionality
	 */
	function init() {
		game = new Game();
		
		initListeners();
	};
	
	/**
	 * Initialises environmental event listeners
	 */	
	function initListeners() {
		$(window).bind("resize", game.resizeCanvas)
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