/**************************************************
** MOVEMENT
**************************************************/

r.namespace("Move");
rawkets.Move = function(time, input, state, test) {
	var time = time, // Time of movement
		input = input, // Input
		state = state; // State before input was applied
		
	return {
		time: time,
		input: input,
		state: state
	};
};