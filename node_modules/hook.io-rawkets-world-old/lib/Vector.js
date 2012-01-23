/**************************************************
** VECTOR
**************************************************/

var Vector = function(x, y) {
	var x = x || 0, // Horizontal position
		y = y || 0; // Vertical position
		
	return {
		x: x,
		y: y
	};
};

exports.init = function(x, y) {
	return new Vector(x, y);
};