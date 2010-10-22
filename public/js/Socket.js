/**
 * Wrapper for WebSocket functionality
 *
 * @author Rob Hawkes
 * @requires io.Socket
 */

/**
 * @constructor
 */
var Socket = function() {
	// Initialise WebSocket
	this.socket = new WebSocket("ws://"+document.location.host+":8080");
	
	// Return socket object
	return this.socket;
};