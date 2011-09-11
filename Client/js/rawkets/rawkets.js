/**************************************************
** RAWKETS NAMESPACE
**************************************************/

(function() {
	// Set up rawkets namespace
	var rawkets = rawkets || {},
 		r = rawkets;
	
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
	
	// Expose rawkets to the global object
	window.rawkets = window.r = rawkets;
})(window);
