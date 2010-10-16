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
		$(window).bind("resize", game.resizeCanvas);
		$(window).bind("mouseup", function(e) {
			game.socket.send(Game.formatMessage("testing", {x: 123, y: 456}));
		});
	};
	
	// Initialise client-side functionality
	init();
});