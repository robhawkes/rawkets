/**************************************************
** VECTOR
**************************************************/

r.namespace("Vector");
rawkets.Vector = function(x, y) {
	// Properties
	
	var x = x || 0, // Horizontal position
		y = y || 0; // Vertical position
	
	// Methods
	var sub = function(vec) {
		var tmpVec = new r.Vector(this.x, this.y);
		
		tmpVec.x -= vec.x;
		tmpVec.y -= vec.y;
		
		return tmpVec;
	};

	return {
		x: x,
		y: y,
		sub: sub
	};
};