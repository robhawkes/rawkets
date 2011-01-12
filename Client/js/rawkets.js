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
	
	// Sort out scoping of variables in here. Ideally I want
	// things like x and y to be private, with an API to access
	// the, from the outside.
	r.namespace("entities.Star");
	rawkets.entities.Star = function(width, height) {
		// Local (private) variables
		var radius = Math.random()*10;
		
		// Public variables
		this.x = Math.random()*width;
		this.y = Math.random()*height;
		
		this.draw = function(ctx) {
			ctx.fillRect(this.x, this.y, radius, radius);
		};
	};
	
	r.namespace("viewport");
	rawkets.viewport = (function() {
		// Dependencies
		var Star = r.entities.Star,
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
		var init = function(tmp_canvas) {
			canvas = tmp_canvas;
			ctx = canvas.getContext("2d");
			width = canvas.width;
			height = canvas.height;
			
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
		
		var drawStars = function() {
			for (var i = 0; i < num_stars; i++) {
				var star = stars[i];
				star.draw(ctx);
			};		
		};
		
		return {
			init: init,
			drawStars: drawStars
		};
	})();

	// Main controller to set up the game (in the current sector?)
	// Using a mixture of the Module and Mediator patterns (pg. 97 & 167
	// in JavaScript Patterns); it knows about other objects, but they
	// don't know each other.
	r.namespace("game");
	rawkets.game = (function() {
		// Dependencies
		var e = r.events.Dispatcher;
			viewport = r.viewport;
		
		var init = function(canvas) {
			// Set up event listeners
			e.listen("viewportLoaded", function() {
				e.fire("windowResize", {width: 600, height: 600});
				viewport.drawStars();
			});
			
			// Initialise viewport
			viewport.init(canvas);
			
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