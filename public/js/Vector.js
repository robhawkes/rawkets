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

Vector.prototype.addX = function(x) {
	/* Add to or remove from the vector X position */
	this.x += x;
}		
Vector.prototype.addY = function(y) {
	/* Add to or remove from the vector Y position */
	this.y += y;
}

Vector.prototype.set = function(x, y) {
	this.x = x; 
	this.y = y;
}

Vector.sub = function(vec1, vec2) {
	var tmpVec = new Vector(vec1.x, vec1.y);
	
	tmpVec.x -= vec2.x;
	tmpVec.y -= vec2.y;
	
	return tmpVec;
};