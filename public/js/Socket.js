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
	//this.socket = new WebSocket("ws://"+document.location.host+":8000");
	this.socket = new WebSocket("ws://socket.rawkets.com:80"); // Testing new server with port 80 socket connection
	
	// Return socket object
	return this.socket;
};