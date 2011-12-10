/**************************************************
** SOCKET COMMUNICATIONS
**************************************************/

r.namespace("Socket");
rawkets.Socket = function(host, port) {
	// Shortcuts
	var e = r.Event;
	
	// Properties
	var socketHost = host,
		socketPort = port,
		socket;

	// Methods
	var setEventHandlers = function() {
		// EVENTS
		// connect, connecting, connect_failed, message, close,
		// disconnect, reconnect, reconnecting, reconnect_failed
		
		// WebSocket connection successful
		socket.on("connect", function() {
			console.log("Connected to server", socketHost+":"+socketPort);
			e.fire("SOCKET_CONNECTED");
		});
	
		// WebSocket connection failed
		socket.on("connect_failed", function() {
			console.log("Connect failed", socketHost+":"+socketPort);
			e.fire("SOCKET_CONNECT_FAILED");
		});
	
		// WebSocket disconnection
		socket.on("disconnect", function() {
			console.log("Disconnected", socketHost+":"+socketPort);
			e.fire("SOCKET_DISCONNECTED");
		});
	
		// WebSocket message received
		socket.on("game message", function(data) {
			e.fire("SOCKET_MESSAGE", data);
		});
	};
	
	var connect = function() {
		socket = io.connect(socketHost, {port: socketPort, transports: ["websocket"]});
		setEventHandlers();
	};
	
	var send = function(msg) {
		if (!msg) {
			return;
		};
		socket.emit("game message", msg);
	};
	
	var getSessionId = function() {
		return socket.socket.sessionid;
	};

	return {
		connect: connect,
		send: send,
		getSessionId: getSessionId
	};
};