/**
 * Vector math
 *
 * @author Rob Hawkes
 */

/**
 * @constructor
 */
var Vector = function(x, y) {
	this.x = x;
	this.y = y;
};

Vector.sub = function(vec1, vec2) {
	var tmpVec = new Vector(vec1.x, vec1.y);
	
	tmpVec.x -= vec2.x;
	tmpVec.y -= vec2.y;
	
	return tmpVec;
};