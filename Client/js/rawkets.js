(function() {
	// Set up rawkets namespace
	var rawkets = rawkets || {};
	var r = rawkets;
	
	// Namespace helper function taken from [JavaScript Patterns](http://www.amazon.co.uk/JavaScript-Patterns-Stoyan-Stefanov/dp/0596806752/) book.
	rawkets.namespace = function(namespace_str) {
		var parts = namespace_str.split("."),
			parent = rawkets,
			i;
		
		// Strip redundant leading global	
		if (parts[0] === "rawkets")	{
			parts = parts.slice(1);
		};
		
		for (i = 0; i < parts.length; i++) {
			// Create a property if it doesn't exist
			if (typeof parent[parts[i]] === "undefined") {
				parent[parts[i]] = {};
			};
			
			parent = parent[parts[i]];
		};
		
		return parent;
	};
	
	// Global event dispatcher to decouple objects and events
	// Based on the Obsersver pattern from http://stackoverflow.com/questions/4458712/custom-events-observer-pattern
	r.namespace("events.Dispatcher");
	rawkets.events.Dispatcher = {
		handlers : {},
		listen: function (event, handler) {
			if (typeof(r.events.Dispatcher.handlers[event]) == "undefined")
				r.events.Dispatcher.handlers[event] = []; 
		
			r.events.Dispatcher.handlers[event].push(handler);
		},
		fire: function (eventName, data) {
			if (r.events.Dispatcher.handlers[eventName]) {
				for (var i = 0; i < r.events.Dispatcher.handlers[eventName].length; i++) {
					r.events.Dispatcher.handlers[eventName][i](data);
				};
			};
		}
	};
	
	r.namespace("input");
	rawkets.input = (function() {
		// Dependencies
		var e = r.events.Dispatcher;
		
		// Local (private) variables
		var keys = {arrow_left: {code: 37, down: false},
					arrow_up: {code: 38, down: false},
					arrow_right: {code: 39, down: false},
					arrow_down: {code: 40, down: false},
					space: {code: 32, down: false}};
		
		// Private methods
		var onKeydown = function(e) {
			var c = e.keyCode;

			for (var key in keys) {
				if (keys[key].code == c) {
					keys[key].down = true;
					return;
				};
			};
			
			//console.log("Key down [code: "+e.keyCode+"]");
		};
		
		var onKeyup = function(e) {
			var c = e.keyCode;
			
			for (var key in keys) {
				if (keys[key].code == c) {
					keys[key].down = false;
					return;
				};
			};
			//console.log("Key up [code: "+e.keyCode+"]");
		};
		
		// Public methods
		var init = function() {
			window.addEventListener("keydown", onKeydown, false);
			window.addEventListener("keyup", onKeyup, false);
		};
		
		var down = function(key_name) {
			if (keys[key_name].down) {
				return true;
			}
			
			return false;
		};
		
		return {
			init: init,
			down: down
		};
	})();
	
	// Sort out scoping of variables in here. Ideally I want
	// things like x and y to be private, with an API to access
	// the, from the outside.
	r.namespace("entities.Player");
	rawkets.entities.Player = (function() {
		// Dependencies
		var input = r.input;
		
		// Local (private) variables
		var x = Math.random()*500;
		var y = Math.random()*500;
		
		// Public methods
		var init = function() {
			
		};
		
		var update = function() {
			if (input.down("arrow_up")) {
				y -= 2;
			};
			
			if (input.down("arrow_down")) {
				y += 2;
			};
			
			if (input.down("arrow_left")) {
				x -= 2;
			};
			
			if (input.down("arrow_right")) {
				x += 2;
			};
		};
		
		var draw = function(ctx) {
			ctx.save();
			ctx.fillStyle = "rgb(255, 0, 0)";
			ctx.fillRect(x-5, y-5, 10, 10);
			ctx.restore();
		};
		
		return {
			init: init,
			update: update,
			draw: draw
		};
	})();
	
	// Sort out scoping of variables in here. Ideally I want
	// things like x and y to be private, with an API to access
	// the, from the outside.
	r.namespace("entities.Star");
	rawkets.entities.Star = function(width, height) {
		// Local (private) variables
		var radius = Math.random()*10;
		var x = Math.random()*width;
		var y = Math.random()*height;
		
		this.draw = function(ctx) {
			ctx.fillRect(x, y, radius, radius);
		};
	};
	
	r.namespace("viewport");
	rawkets.viewport = (function() {
		// Dependencies
		var Star = r.entities.Star,
			player = r.entities.Player,
			e = r.events.Dispatcher;
		
		// Local (private) variables
		var canvas,
			ctx,
			width,
			height,
			num_stars = 50,
			stars = [];
			
		// Private methods
		var resize = function(e) {
			var ratio = {x: e.width/width, y: e.height/height};
			
			canvas.width = width = e.width;
			canvas.height = height = e.height;
			
			// Resize stars
			for (var i = 0; i < num_stars; i++) {
				var star = stars[i];
				star.x *= ratio.x;
				star.y *= ratio.y;
			};
			
			drawStars();
		};
		
		// Public methods
		var init = function(tmp_canvas, tmp_width, tmp_height) {
			canvas = tmp_canvas;
			ctx = canvas.getContext("2d");
			width = tmp_width;
			height = tmp_height;
			
			// Resize the canvas
			canvas.width = width;
			canvas.height = height;
			
			// Set up stars
			for (var i = 0; i < num_stars; i++) {
				var new_star = new Star(width, height);
				stars.push(new_star);
			};
			
			// Update position of stars when player moves
			//e.listen("playerMove", updateStars);
			
			e.listen("windowResize", resize);

			e.fire("viewportLoaded");
		};
		
		var draw = function() {
			ctx.clearRect(0, 0, width, height);
			drawStars();
			player.draw(ctx);
		};
		
		var drawStars = function() {
			for (var i = 0; i < num_stars; i++) {
				var star = stars[i];
				star.draw(ctx);
			};		
		};
		
		return {
			init: init,
			draw: draw
		};
	})();

	// Main controller to set up the game (in the current sector?)
	// Using a mixture of the Module and Mediator patterns (pg. 97 & 167
	// in JavaScript Patterns); it knows about other objects, but they
	// don't know each other.
	r.namespace("game");
	rawkets.game = (function() {
		// Dependencies
		var e = r.events.Dispatcher,
			viewport = r.viewport,
			input = r.input,
			player = r.entities.Player;
			
		// Local (private) variables
			
		// Private methods
		var update = function() {
			player.update();
		};
		
		var draw = function() {
			viewport.draw();
		};
		
		var loop = function() {
			update();
			draw();
			
			// Restart loop (use requestAnimationFrame)
			setTimeout(loop, 33);
		};
		
		// Public methods
		var init = function(canvas, width, height) {
			// Set up event listeners
			// Window resize listener
			window.addEventListener("resize", function(evt) {
				var w = evt.target;
				e.fire("windowResize", {width: w.innerWidth, height: w.innerHeight});
			}, false);
			
			// Viewport loaded listener
			e.listen("viewportLoaded", function() {
				
			});
			
			// Initialise viewport
			viewport.init(canvas, width, height);
			console.log(viewport);
			
			// Initialise input
			input.init();
			
			// Initialise player
			player.init();
			
			// Start game loop
			loop();
			
			// Sector has finished loading
			e.fire("sectorLoaded");
		};
		
		return {
			// Initialise the game environment
			init: init
		};
	})();
	
	// Expose rawkets to the global object
	window.rawkets = window.r = rawkets;
})(window);