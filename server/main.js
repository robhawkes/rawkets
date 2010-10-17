var sys = require("sys");
var	io = require("socket.io");
var http = require("http");

/**
 * Initialises server-side functionality
 */
function init() {
	// Initialise HTTP server
	var server = http.createServer(function(req, res) {});		
	server.listen(8080);
	
	// Initialise socket connection
	var socket = io.listen(server);
	
	// On incoming connection from client
	socket.on("connection", function(client) { 
		//client.broadcast("New user connected");
		//client.send("Session ID: "+client.sessionId);
		//client.send(formatMessage("playerSession", {id: client.sessionId})); // Why does the session need to be sent?
		
		// On incoming message from client
		client.on("message", function(data) {
			var json = JSON.parse(data);
			
			// Only deal with messages using the correct protocol
			if (json.type) {
				switch (json.type) {
					default:
						sys.log("Incoming message: ");
						console.log(json);
				};
			// Invalid message protocol
			} else {
				
			};
		});
		
		// On client disconnect
		client.on('disconnect', function(){
			//client.broadcast("User disconnected "+client.sessionId);
		});	
	});
};

/**
 * Format message using game protocols
 *
 * @param {String} type Type of message
 * @param {Object} args Content of message
 * @returns Formatted message as a JSON string. Eg. {type: "update", message: "Hello World"}
 * @type String
 */
function formatMessage(type, args) {
	var msg = {type: type};

	for (var arg in args) {
		// Don't overwrite the message type
		if (arg != "type")
			msg[arg] = args[arg];
	};
	
	return JSON.stringify(msg);
};

// Initialise the server-side functionality
init();