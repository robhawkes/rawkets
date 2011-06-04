/**************************************************
** INPUT
**************************************************/

r.namespace("Input");
// Forward 	- Integer of forward input (0 stopped, 1 go forward)
// Rotation - Integer of rotation input (0 stopped, -1 rotate left, 1 rotate right)
rawkets.Input = function(forward, rotation) {
	var forward = forward || 0,
		rotation = rotation || 0;
		
	return {
		forward: forward,
		rotation: rotation
	};
};