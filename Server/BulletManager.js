/**************************************************
** BULLET MANAGER
**************************************************/

var Bullet = require("./Bullet"),
	Vector = require("./Vector");

var BulletManager = function() {
	var bullets = [];

	var add = function(id, playerId, x, y, a, msgOutQueue) {
		var tmpBullet = Bullet.init(id, playerId, x, y, a);
		bullets.push(tmpBullet);

		// This really needs to be moved into an event that is picked up by the main game logic
		msgOutQueue.push({msg: formatMessage(8, {id: tmpBullet.id, s: tmpBullet.getState(true)})});
	};

	var updateState = function() {
		var bullet,
			bulletCount = bullets.length,
			i;

		for (i = 0; i < bulletCount; i++) {
			bullet = bullets[i];
			
			if (!bullet) {
				continue;
			};
			
			bullet.updateState();
		};
	};

	var update = function(rk4) {
		var bullet,
			bulletCount = bullets.length,
			i;

		for (i = 0; i < bulletCount; i++) {
			bullet = bullets[i];
			
			if (!bullet) {
				continue;
			};
			
			// Skip update if the entity is still
			rk4.integrate(bullet.currentState);
		};
	};

	// Right now this only works for AI players
	var collision = function(aiPlayers, msgOutQueue) {
		var bullet,
			bulletCount = bullets.length,
			aiPlayerCount = aiPlayers.length,
			aiPlayerPos,
			bulletPos,
			diff,
			dd,
			distance,
			i, j;

		for (i = 0; i < bulletCount; i++) {
			bullet = bullets[i];
			
			if (!bullet) {
				continue;
			};

			for (j = 0; j < aiPlayerCount; j++) {
				aiPlayer = aiPlayers[j];
					
				if (!aiPlayer || aiPlayer.player.id == bullet.playerId) {
					continue;
				};

				aiPlayerPos = aiPlayer.player.currentState.p;
				bulletPos = bullet.currentState.p;

				diff = Vector.init();
				diff.x = aiPlayerPos.x - bulletPos.x;
				diff.y = aiPlayerPos.y - bulletPos.y;

				dd = (diff.x * diff.x) + (diff.y * diff.y);
				distance = Math.sqrt(dd);

				// Player is dead
				if (distance < 10) {
					// Kill bullet
					bullet.currentState.h = 0;

					// Kill player
					//console.log("Kill player");
					aiPlayer.player.bulletHit();

					continue;
				};
			};
			
			// This really needs to be moved into an event that is picked up by the main game logic
			msgOutQueue.push({msg: formatMessage(9, {id: bullet.id, s: bullet.getState(true)})});
		};

		// Remove dead bullets
		for (i = bulletCount-1; i >= 0; i--) {
			bullet = bullets[i];

			if (!bullet) {
				continue;
			};

			// Remove bullet if it's older than 500ms
			if (bullet.currentState.h == 0 || Date.now() - bullet.born > 750) {
				// This really needs to be moved into an event that is picked up by the main game logic
				msgOutQueue.push({msg: formatMessage(10, {id: bullet.id})});
				bullets.splice(bullets.indexOf(bullet), 1);
			};
		};
	};

	return {
		add: add,
		updateState: updateState,
		update: update,
		collision: collision
	};
};

exports.init = function() {
	return new BulletManager();
};

// REMOVE EVERYTHING BELOW THIS POINT
// It's just here to aid my sloppy coding for testing

/**************************************************
** MESSAGE FORMATTER
**************************************************/

function formatMessage(type, args) {
	var msg = {z: type};

	for (var arg in args) {
		// Don't overwrite the message type
		if (arg != "z")
			msg[arg] = args[arg];
	};

	return msg;
};