var sys = require("sys"),
	io = require("socket.io").listen(8000);

io.configure(function() {
	io.set("transports", ["websocket"]);
	io.set("log level", 2);
});

socket = io.sockets.on("connection", function(client){
	client.on("ping", function() {
		client.emit("pong", Date.now());
	});
});