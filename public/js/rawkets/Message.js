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
	// Eventually grab from data sent to client from server on connection
	messageTypes = [{
			"name": "ping",
			"args": ["timestamp"]
		}, {
			"name": "sync",
			"args": ["screenWidth", "screenHeight"]
		}, {
			"name": "syncCompleted",
			"args": []
		}, {
			"name": "newPlayer",
			"args": ["id", "name", "x", "y", "angle", "health", "force", "colour"]
		}, {
			"name": "updatePlayer",
			"args": ["id", "x", "y", "angle", "health", "force"]
		}, {
			"name": "updateInput",
			"args": ["forward", "rotation", "fire"]
		}, {
			"name": "removePlayer",
			"args": ["id"]
		}, {
			"name": "newBullet",
			"args": ["id", "x", "y", "angle"]
		}, {
			"name": "updateBullet",
			"args": ["id", "x", "y"]
		}, {
			"name": "removeBullet",
			"args": ["id"]
		}, {
			"name": "updatePlayerScreen",
			"args": ["width", "height"]
		}
	],
	// This part can probably be autogenerated based on the order in messageTypes
	typeIndexes = {
		"ping": 0,
		"sync": 1,
		"syncCompleted": 2,
		"newPlayer": 3,
		"updatePlayer": 4,
		"updateInput": 5,
		"removePlayer": 6,
		"newBullet": 7,
		"updateBullet": 8,
		"removeBullet": 9,
		"updatePlayerScreen": 10
	}
	
	// Methods
	var encode = function(args) {
		var msg = args.join("|");
		return msg;
	}

	var decode = function(msg) {
		var msgParts = msg.split("|"),
			typeIndex = parseInt(msgParts.shift(), 10),
			type = messageTypes[typeIndex],
			args = {};

		msgParts.forEach(function(arg, index) {
			args[type.args[index]] = arg;
		});

		return {typeIndex: typeIndex, type: type, args: args};
	}
	
	var send = function(msg, immediately) {
		// Send message immediately
		if (msg && immediately) {
			socket.send(msg);
			//console.log(msg.z+" sent at "+Date.now());
			return;
		}
		
		// Otherwise add message to the queue
		outgoing.push(msg);
	};
	
	var onSocketMessage = function(msg) {
		//console.log(msg);

		if (msg && !msg.z) {
			var msgDecoded = decode(msg);

			if (!msgDecoded) {
				return;
			}
			
			switch (msgDecoded.typeIndex) {
				case typeIndexes.ping:
					e.fire("PING", msgDecoded);
					break;
				case typeIndexes.syncCompleted:
					e.fire("SYNC_COMPLETED", msgDecoded);
					break;
				case typeIndexes.newPlayer:
					e.fire("NEW_PLAYER", msgDecoded);
					break;
				case typeIndexes.updatePlayer:
					e.fire("UPDATE_PLAYER", msgDecoded);
					break;
				case typeIndexes.removePlayer:
					e.fire("REMOVE_PLAYER", msgDecoded);
					break;
				case typeIndexes.newBullet:
					e.fire("NEW_BULLET", msgDecoded);
					break;
				case typeIndexes.updateBullet:
					e.fire("UPDATE_BULLET", msgDecoded);
					break;
				case typeIndexes.removeBullet:
					e.fire("REMOVE_BULLET", msgDecoded);
					break;
			}
		}
	};
	
	var setEventHandlers = function() {
		e.listen("SOCKET_MESSAGE", onSocketMessage);
	};
	
	return {
		typeIndexes: typeIndexes,
		encode: encode,
		decode: decode,
		send: send,
		setEventHandlers: setEventHandlers
	};
};