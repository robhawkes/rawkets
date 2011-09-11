/**************************************************
** VECTOR
**************************************************/

r.namespace("Vector");
rawkets.Vector = function(x, y) {
	// Properties
	
	var x = x || 0, // Horizontal position
		y = y || 0; // Vertical position
	
	// Methods

	return {
		x: x,
		y: y
	};
};