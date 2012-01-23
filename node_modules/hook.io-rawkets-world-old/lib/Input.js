/**************************************************
** INPUT
**************************************************/

// Forward 	- Integer of forward input (0 stopped, 1 go forward)
// Rotation - Integer of rotation input (0 stopped, -1 rotate left, 1 rotate right)
// Fire 	- Integer of fire weapon input (0 not firing, 1 fire)
var Input = function(forward, rotation, fire) {
	var forward = forward || 0,
		rotation = rotation || 0,
		fire = fire || 0;
		
	return {
		forward: forward,
		rotation: rotation,
		fire: fire
	};
};

exports.init = function(forward, rotation, fire) {
	return new Input(forward, rotation, fire);
};