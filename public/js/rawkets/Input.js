/**************************************************
** INPUT HANDLER
**************************************************/

r.namespace("Input");
rawkets.Input = function(forward, rotation, fire) {
	var forward = forward || 0, // Integer (0 stopped, 1 go forward)
		rotation = rotation || 0, // Integer (0 stopped, -1 rotate left, 1 rotate right)
		fire = fire || 0; // Integer (0 hold fire, 1 fire)
		
	return {
		forward: forward,
		rotation: rotation,
		fire: fire
	};
};