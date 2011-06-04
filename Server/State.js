/**************************************************
** ENTITY STATE
**************************************************/

var Vector = require("./Vector");

var State = function(x, y, vx, vy, f, a) {
	var p = Vector.init(x, y) || Vector.init(0, 0), // Position
		a = a || 0, // Angle
		v = Vector.init(vx, vy) || Vector.init(0, 0), // Velocity (directionless, needs angle)
		f = f || 0; // Force (for acceleration, needs angle)
		
	return {
		p: p,
		a: a,
		v: v,
		f: f
	};
};

exports.init = function(x, y, vx, vy, f, a) {
	return new State(x, y, vx, vy, f, a);
};