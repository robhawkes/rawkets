/**************************************************
** ENTITY STATE
**************************************************/

r.namespace("State");
rawkets.State = function(x, y, a, f, h, vx, vy) {
	var p = new r.Vector(x, y) || new Vector(0, 0), // Position
		a = a || 0, // Angle
		v = new r.Vector(vx, vy) || new Vector(0, 0), // Velocity (directionless, needs angle)
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