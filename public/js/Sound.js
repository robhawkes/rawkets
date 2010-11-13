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
	};
};

Sound.prototype.stop = function(soundName) {
	switch (soundName) {
		case "thrust":
			this.container.stopThrust();
			break;
	};
};