/**************************************************
** MESSAGE CONTROLLER
**************************************************/

r.namespace("Message");
rawkets.Message = function(socket) {
	// Shortcuts
	var e = r.Event;
	
	// Properties
	var socket = socket;
	
	// Queues
	var incoming = [],
		outgoing = [],
		
	// Types
		types = {
			MESSAGE_TYPE_PING: 1
		};
	
	// Methods
	var format = function(type, args) {
		if (types[type] == undefined) {
			console.log("Cannot format message", type, args);
			return false;
		};
		
		var msg = {z: types[type]};

		for (var arg in args) {
			// Don't overwrite the message type
			if (arg != "z")
				msg[arg] = args[arg];
		};

		//return JSON.stringify(msg);
		return BISON.encode(msg);
	};
	
	var send = function(msg, immediately) {
		if (msg && immediately) {
			socket.send(msg);
			return;
		};
		
		outgoing.push(msg);
	};
	
	var onSocketMessage = function(data) {
		var msg = BISON.decode(data);
		
		if (msg.z !== undefined) {
			// Make this automated so you can refer message type from the received message
			switch (msg.z) {
				case types.MESSAGE_TYPE_PING:
					e.fire("MESSAGE_TYPE_PING", msg);
					break;
			};
		};
	};
	
	var init = function() {
		e.listen("SOCKET_MESSAGE", onSocketMessage);
	};
	
	return {
		init: init,
		types: types,
		format: format,
		send: send
	};
};