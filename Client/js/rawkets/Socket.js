/**************************************************
** SOCKET COMMUNICATIONS
**************************************************/

r.namespace("Socket");
rawkets.Socket = function(host, port) {
	// Shortcuts
	var e = r.Event;
	
	// Properties
	var WEB_SOCKET_SWF_LOCATION = "lib/WebSocketMain.swf",
		socketHost = host,
		socketPort = port,
		socket;

	// Methods
	var setEventHandlers = function() {
		// EVENTS
		// connect, connecting, connect_failed, message, close,
		// disconnect, reconnect, reconnecting, reconnect_failed
		
		// WebSocket connection successful
		socket.on("connect", function() {
			console.log("Connected");
			e.fire("SOCKET_CONNECTED");
		});
	
		// WebSocket connection failed
		socket.on("connect_failed", function() {
			console.log("Connect failed");
			e.fire("SOCKET_CONNECT_FAILED");
		});
	
		// WebSocket disconnection
		socket.on("disconnect", function() {
			console.log("Disconnected");
			e.fire("SOCKET_DISCONNECTED");
		});
	
		// WebSocket message received
		socket.on("message", function(data) {
			e.fire("SOCKET_MESSAGE", data);
		});
	};
	
	var connect = function() {
		socket = new io.Socket(socketHost, {port: socketPort, transports: ["websocket", "flashsocket"]});
		setEventHandlers();
		socket.connect();
	};
	
	var send = function(msg) {
		if (!msg) {
			return;
		};
		socket.send(msg);
	};
	
	var getSessionId = function() {
		return socket.transport.sessionid;
	};

	return {
		connect: connect,
		send: send,
		getSessionId: getSessionId
	};
};