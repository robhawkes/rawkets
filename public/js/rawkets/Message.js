/**************************************************
** MESSAGE CONTROLLER
**************************************************/

r.namespace("Message");
rawkets.Message = function(socket) {
	// Shortcuts
	var e = r.Event,
		p = r.Profiler;
	
	// Properties
	var socket = socket;
	
	// Queues
	var incoming = [],
		outgoing = [],
		
	// Types
	types = {
		PING: 1,
		SYNC: 2,
		SYNC_COMPLETED: 3,
		NEW_PLAYER: 4,
		UPDATE_PLAYER: 5,
		UPDATE_INPUT: 6,
		REMOVE_PLAYER: 7,
		MESSAGE_TYPE_NEW_BULLET: 8,
		MESSAGE_TYPE_UPDATE_BULLET: 9,
		MESSAGE_TYPE_REMOVE_BULLET: 10,
		UPDATE_PLAYER_SCREEN: 11
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
		//return BISON.encode(msg);
		return msg;
	};
	
	var send = function(msg, immediately) {
		// Send message immediately
		if (msg && immediately) {
			socket.send(msg);
			//console.log(msg.z+" sent at "+Date.now());
			return;
		};
		
		// Otherwise add message to the queue
		outgoing.push(msg);
	};
	
	var onSocketMessage = function(msg) {
		if (msg.z !== undefined) {
			// Make this automated so you can refer message type from the received message
			switch (msg.z) {
				case types.PING:
					//console.log("Message id "+msg.z+" received at "+Date.now());
					e.fire("PING", msg);
					break;
				case types.SYNC_COMPLETED:
					e.fire("SYNC_COMPLETED", msg);
					break;
				case types.NEW_PLAYER:
					e.fire("NEW_PLAYER", msg);
					break;
				case types.UPDATE_PLAYER:
					e.fire("UPDATE_PLAYER", msg);
					break;
				case types.REMOVE_PLAYER:
					e.fire("REMOVE_PLAYER", msg);
					break;
				case types.MESSAGE_TYPE_NEW_BULLET:
					e.fire("NEW_BULLET", msg);
					break;
				case types.MESSAGE_TYPE_UPDATE_BULLET:
					e.fire("UPDATE_BULLET", msg);
					break;
				case types.MESSAGE_TYPE_REMOVE_BULLET:
					e.fire("REMOVE_BULLET", msg);
					break;
			};
		};
	};
	
	var setEventHandlers = function() {
		e.listen("SOCKET_MESSAGE", onSocketMessage);
	};
	
	return {
		format: format,
		send: send,
		setEventHandlers: setEventHandlers
	};
};