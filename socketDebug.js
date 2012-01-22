var util = require("util"),
	express = require("express"),
	app;

(function() {
	app = express.createServer();

	app.configure(function(){
		app.set("views", __dirname + "/views");
		app.set("view engine", "hbs");
		app.use(express.bodyParser());
		app.use(express.methodOverride());
		app.use(app.router);
		app.use(express.static(__dirname + "/public"));
	});

	app.configure("development", function(){
		app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
	});

	app.configure("production", function(){
		app.use(express.errorHandler());
	});

	app.listen(8000);
})();

var io = require("socket.io").listen(app);

io.set("log level", 2);
io.set("transports", [
	"websocket"
]);

// Client connected
io.sockets.on("connection", function(client) {
	client.on("game message", function(msg) {
		
	});
});

setInterval(function() {
	var msg = "8|bullet1327149276074ai1327149208278129|1555.53|100.09,8|bullet1327149276074ai1327149208278129|1555.53|100.09,4|1043350442119848864|750|300|0|79.49999999999969|0,4|ai1327149208278129|440.3|450.87|0.75|74.79999999999995|250,4|ai13271492082789865|515.95|532.13|3.88|61.54999999999923|250";
	msg += msg += msg += msg += msg += msg += msg += msg += msg += msg += msg += msg += msg += msg += msg += msg += msg += msg += msg;
	io.sockets.emit("game message", msg);
}, 50);


// var WebSocketServer = require("ws").Server,
// 	wss = new WebSocketServer({port: 8080});

// wss.on("connection", function(ws) {
// 	ws.on("message", function(message) {

// 	});

// 	ws.on("close", function() {
// 		console.log("Disconnected");
// 	});
	
// 	setInterval(function() {
// 		if (ws.readyState === 1) {
// 			ws.send("TESTING A FAIRLY SHORT PACKET");
// 		}
// 	}, 100);
// });