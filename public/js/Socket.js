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
	this.io = new io.Socket(null, {port: 8080});

	// Connect to socket server
	this.io.connect();
	
	return this.io;
};