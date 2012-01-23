/**************************************************
** EULER PHYSICS SIMULATOR
**************************************************/

var Vector = require("./Vector");

var Euler = function() {
	var integrate = function(state, dt) {
		state.p.x += state.v.x * dt;
		state.p.y += state.v.y * dt;

		var acceleration = Vector.init(Math.cos(state.a)*state.f, Math.sin(state.a)*state.f);

		state.v.x += acceleration.x * dt;
		state.v.y += acceleration.y * dt;
	};

	return {
		integrate: integrate
	};
};

exports.init = function() {
	return new Euler();
};