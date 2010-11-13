/**
 * Sound manager
 *
 * @author Rob Hawkes
 */

/**
 * @constructor
 */
var Sound = function() {
	this.container = $("#soundContainer").get(0);
};

Sound.prototype.play = function(soundName) {
	switch (soundName) {
		case "background":
			this.container.playBackground();
			break;
		case "thrust":
			this.container.playThrust();
			break;
		case "laser":
			this.container.playLaser();
			break;
		case "respawn":
			this.container.playRespawn();
			break;
		case "die":
			this.container.playDie();
			break;
	};
};

Sound.prototype.stop = function(soundName) {
	switch (soundName) {
		case "thrust":
			this.container.stopThrust();
			break;
	};
};