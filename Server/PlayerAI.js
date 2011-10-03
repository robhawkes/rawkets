/**************************************************
** PLAYER AI
**************************************************/

// Should this inherit the Player class?
// - Probably, but I'll worry about that later.
// Need to convert this to use events

var Player = require("./Player"),
	Vector = require("./Vector"),
	Input = require("./Input");

var PlayerAI = function(id, x, y) {
	// State types
	var stateTypes = {
		EXPLORE: 1,
		ATTACK: 2
	};

	// Player object for AI
	var player = Player.init(id, x, y),
	// AI state
		state,
	// AI target (both for attack and defense)
		target = false;

	var setTarget = function(player) {
		target = player;
	};

	var setState = function(stateType) {
		state = stateType;
	};

	var getTargetInfo = function(player, target) {
		var currentPos = player.currentState.p,
			targetPos = target.currentState.p,
			diff = Vector.init(),
			relativeDiff = Vector.init(),
			dd,
			distance,
			angle;
		
		diff.x = targetPos.x - currentPos.x;
		diff.y = targetPos.y - currentPos.y;

		dd = (diff.x * diff.x) + (diff.y * diff.y);
		distance = Math.sqrt(dd);

		relativeDiff.x = diff.x * Math.cos(player.currentState.a) + diff.y * Math.sin(player.currentState.a);
		relativeDiff.y = diff.y * Math.cos(player.currentState.a) - diff.x * Math.sin(player.currentState.a);

		// Remember that atan2 is reverse direction to angles in canvas
		// Positive anti-clockwise, negative clockwise
		angle = Math.atan2(relativeDiff.y, relativeDiff.x);

		return {
			angle: angle
		};
	};

	var update = function(players, aiPlayers) {
		// Check state
		switch (state) {
			case stateTypes.EXPLORE:
				// Do nothing for now
				break;
			case stateTypes.ATTACK:
				// Find a target (do this here or somewhere else?)
				// Move to and attack the target
				var targetInfo = getTargetInfo(player, target);

				if (targetInfo.angle > 0.05 && targetInfo.angle < Math.PI) {
					player.updateInput(Input.init(1, 1));
				} else if (targetInfo.angle < -0.05 && targetInfo.angle > -Math.PI) {
				 	player.updateInput(Input.init(1, -1));
				} else {
					player.updateInput(Input.init(1, 0));
				};

				break;
			default:
				// Default state
				if (players.length > 0) {
					target = players[0];
					state = stateTypes.ATTACK;
				};
		};
	};

	return {
		//stateTypes: stateTypes,
		player: player,
		//setTarget: setTarget,
		//setState: setState,
		update: update
	};
};

exports.init = function(id, x, y) {
	return new PlayerAI(id, x, y);
};