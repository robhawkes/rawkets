/**************************************************
** PLAYER AI
**************************************************/

// Should this inherit the Player class?
// - Probably, but I'll worry about that later.
// Need to convert this to use events

var Player = require("./Player"),
	Vector = require("./Vector"),
	Input = require("./Input");

var PlayerAI = function(id, name, x, y) {
	// State types
	var stateTypes = {
		EXPLORE: 1,
		ATTACK: 2
	};

	// Player object for AI
	var player = Player.init({id: id, name: name, x: x, y: y}),
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
			distance: distance,
			angle: angle
		};
	};

	var update = function(players, aiPlayers, worldWidth, worldHeight) {
		// Check state
		switch (state) {
			case stateTypes.EXPLORE:
				// Do nothing for now
				break;
			case stateTypes.ATTACK:
				var newInput = player.getInput(),
					currentPos = player.currentState.p,
					currentAngle = player.currentState.a,
					edgeDist = {
						top: currentPos.y,
						bottom: worldHeight-currentPos.y,
						left: currentPos.x,
						right: worldWidth-currentPos.x
					};

				// Move forward by default
				newInput.forward = 1;
				newInput.rotation = 0;
				newInput.fire = 0;

				//var angleLimit = Math.PI*(Math.random()*0.5);
				var angleLimit = Math.PI*0.1;
				
				// Check distance to edges
				if (edgeDist.top < 150) {
					//newInput.forward = 0;
					if (currentAngle > Math.PI/2-angleLimit && currentAngle < Math.PI/2+angleLimit) {
						newInput.rotation = 0;
					} else {
						//newInput.rotation = (Math.random() % 0.5 < 0.2) ? -1 : 1;
						newInput.rotation = 1;
					};
				} else if (edgeDist.bottom < 150) {
					//newInput.forward = 0;
					if (currentAngle > (3*Math.PI)/2-angleLimit && currentAngle < (3*Math.PI)/2+angleLimit) {
						newInput.rotation = 0;
					} else {
						//newInput.rotation = (Math.random() % 0.5 < 0.2) ? -1 : 1;
						newInput.rotation = 1;
					};
				} else if (edgeDist.left < 150) {
					//newInput.forward = 0;
					if (currentAngle > Math.PI*2-angleLimit || currentAngle < angleLimit) {
						newInput.rotation = 0;
					} else {
						//newInput.rotation = (Math.random() % 0.5 < 0.2) ? -1 : 1;
						newInput.rotation = 1;
					};
				} else if (edgeDist.right < 150) {
					//newInput.forward = 0;
					if (currentAngle > Math.PI-angleLimit && currentAngle < Math.PI+angleLimit) {
						newInput.rotation = 0;
					} else {
						//newInput.rotation = (Math.random() % 0.5 < 0.2) ? -1 : 1;
						newInput.rotation = 1;
					};
				};

				// Find a target (do this here or somewhere else?)
				var i, aiPlayerCount = aiPlayers.length, aiPlayer, tmpTargetInfo, targetInfo, nearestTargetDistance;
				var tmpCount = 0;
				if (aiPlayerCount > 0) {
					for (i = 0; i < aiPlayerCount; i++) {
						aiPlayer = aiPlayers[i].player;

						// Same player or on the same team
						if (aiPlayer.id == player.id || aiPlayer.name == player.name) {
							continue;
						};

						tmpTargetInfo = getTargetInfo(player, aiPlayer);

						// Change target if player is closer than the others
						if (!nearestTargetDistance || tmpTargetInfo.distance < nearestTargetDistance) {
							nearestTargetDistance = tmpTargetInfo.distance;
							target = aiPlayer;
							targetInfo = tmpTargetInfo;
						};
					};
				};

				// Move to and attack the target
				if (target && targetInfo) {
					newInput.forward = (targetInfo.distance < 50) ? 0 : 1;

					if (targetInfo.angle > 0.05 && targetInfo.angle < Math.PI) {
						newInput.rotation = 1;
					} else if (targetInfo.angle < -0.05 && targetInfo.angle > -Math.PI) {
					 	newInput.rotation = -1;
					} else {
						newInput.rotation = 0;
					};

					// Fire if within a certain distance 
					if (targetInfo.distance < 600) {
						newInput.fire = 1;
					};
				};

				player.updateInput(newInput);

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

exports.init = function(id, name, x, y) {
	return new PlayerAI(id, name, x, y);
};