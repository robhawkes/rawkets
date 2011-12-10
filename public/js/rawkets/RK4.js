/**************************************************
** RK4 PHYSICS SIMULATOR
**************************************************/

r.namespace("RK4");
rawkets.RK4 = function() {
	var	dt = 0.01, // Simulation timestep
		accumulator = 0.0; // Accumulated time each update in ms
		
	var integrate = function(state) {
		var a = evaluate(state, 0.0, {dx: 0, dy: 0, dvx: 0, dvy: 0}),
			b = evaluate(state, dt*0.5, a),
			c = evaluate(state, dt*0.5, b),
		 	d = evaluate(state, dt, c),

			dxdt = 1.0/6.0 * (a.dx + 2.0*(b.dx + c.dx) + d.dx),
			dydt = 1.0/6.0 * (a.dy + 2.0*(b.dy + c.dy) + d.dy),
			dvxdt = 1.0/6.0 * (a.dvx + 2.0*(b.dvx + c.dvx) + d.dvx);
			dvydt = 1.0/6.0 * (a.dvy + 2.0*(b.dvy + c.dvy) + d.dvy);

		state.p.x = state.p.x + dxdt * dt;
		state.p.y = state.p.y + dydt * dt;
		state.v.x = state.v.x + dvxdt * dt;
		state.v.y = state.v.y + dvydt * dt;

		// Snap velocity when near 0
		if (Math.abs(state.v.x) < 0.01) {
			state.v.x = 0;
		};
		
		if (Math.abs(state.v.y) < 0.01) {
			state.v.y = 0;
		};
	};
	
	var evaluate = function(initial, dt, derivative) {
		var state = new r.State(),
			output = {dx: 0, dy: 0, dvx: 0, dvy: 0};

		state.p.x = initial.p.x + derivative.dx*dt;
		state.p.y = initial.p.y + derivative.dy*dt;
		state.v.x = initial.v.x + derivative.dvx*dt;
		state.v.y = initial.v.y + derivative.dvy*dt;
		state.f = initial.f;
		state.a = initial.a;

		output.dx = state.v.x;
		output.dy = state.v.y;
		
		var dv = acceleration(state);
		output.dvx = dv.x;
		output.dvy = dv.y;

		return output;
	};
	
	var acceleration = function(state) {	
		// Thrust (force) divided by mass (1.0)
		return new r.Vector(Math.cos(state.a)*state.f, Math.sin(state.a)*state.f);
	};
	
	return {
		dt: dt,
		accumulator: accumulator,
		integrate: integrate
	};
};