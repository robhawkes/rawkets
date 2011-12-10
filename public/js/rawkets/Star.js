// Sort out scoping of variables in here. Ideally I want
// things like x and y to be private, with an API to access
// the, from the outside.

r.namespace("Star");
rawkets.Star = function(width, height) {
	var radius = Math.random()*10,
		pos = new r.Vector(Math.random()*width, Math.random()*height),
		z = Math.random()*0.3;

	var update = function(movementDelta) {
		pos.x -= movementDelta.x*(z+0.3);
		pos.y -= movementDelta.y*(z+0.3);
	};
	
	var draw = function(ctx) {
		ctx.save();
		ctx.fillStyle = "rgba(255, 255, 255, "+(0.4+(z*0.3))+")";
		ctx.beginPath();
		ctx.arc(pos.x, pos.y, (z*10), 0, Math.PI*2, false);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	};

	return {
		pos: pos,
		update: update,
		draw: draw
	};
};