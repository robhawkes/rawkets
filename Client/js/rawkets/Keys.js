/**************************************************
** KEYS OBJECT
**************************************************/

r.namespace("Keys");
rawkets.Keys = function(up, left, right) {
	var up = up || false,
		left = left || false,
		right = right || false;

	return {
		up: up,
		left: left,
		right: right
	};
};