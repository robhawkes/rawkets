/**************************************************
** ENTITY STATE
**************************************************/

r.namespace("State");
rawkets.State = function(opts) {
	var p = new r.Vector(Number(opts.x), Number(opts.y)) || new Vector(0, 0), // Position
		a = Number(opts.a) || 0, // Angle
		//v = new r.Vector(opts.vx, opts.vy) || new Vector(0, 0), // Velocity (directionless, needs angle)
		f = opts.f || 0, // Force (for acceleration, needs angle)
		h = Number(opts.h) || 100; // Health
		
	return {
		p: p,
		a: a,
		//v: v,
		f: f,
		h: h
	};
};