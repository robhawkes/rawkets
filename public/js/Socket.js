/**
 * Wrapper for Socket.IO functionality
 *
 * @author Rob Hawkes
 * @requires io.Socket
 */

/**
 * @constructor
 */
var Socket = function() {
	// Initialise Socket.IO object
	//this.io = new io.Socket(null, {port: 8080, transports: ["websocket"]});
	this.socket = new WebSocket("ws://localhost:8080");
	//this.socket = new WebSocket("ws://robinhawkes.com:8080");

	// Connect to socket server
	//this.io.connect();
	
	// Return socket object
	//return this.io;
	return this.socket;
};