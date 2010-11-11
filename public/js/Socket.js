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
	this.socket = new WebSocket("ws://socket.rawkets.com:8000"); // Testing new server with port 8000 socket connection
	
	// Return socket object
	return this.socket;
};