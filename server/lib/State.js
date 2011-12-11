/**************************************************
** ENTITY STATE
**************************************************/

var Vector = require("./Vector");

var State = function(x, y, a, f, h, vx, vy) {
	var p = Vector.init(x, y) || Vector.init(0, 0), // Position
		a = a || 0, // Angle
		v = Vector.init(vx, vy) || Vector.init(0, 0), // Velocity (directionless, needs angle)
		f = f || 0, // Force (for acceleration, needs angle)
		h = h || 100; // Health
		
	return {
		p: p,
		a: a,
		v: v,
		f: f,
		h: h
	};
};

exports.init = function(x, y, a, f, h, vx, vy) {
	return new State(x, y, a, f, h, vx, vy);
};