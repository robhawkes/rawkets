window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame 	|| 
	window.webkitRequestAnimationFrame		|| 
	window.mozRequestAnimationFrame			|| 
	window.oRequestAnimationFrame 			|| 
	window.msRequestAnimationFrame 			|| 
	function(callback, element){
		window.setTimeout(callback, 1000 / 60);
	};
})();

// var socketHost = "localhost",
// 	socketPort = 8000,
// 	socket,
// 	ping,
// 	pong;

// socket = io.connect(socketHost, {port: socketPort, transports: ["websocket"]});

// socket.on("pong", function(time) {
// 	pong = Date.now();
// 	console.log(pong-ping);
// });

// setInterval(function() {
// 	ping = Date.now();
// 	socket.emit("ping");
// }, 2000);

var e = r.Event,
	ps = r.ProfilerSession;

var profiler = new r.Profiler();
profiler.init();

// window.addEventListener("keyup", function(e) {
// 	var c = e.keyCode;
// 	switch (c) {
// 		case 80: // p
// 			r.Event.fire("PROFILER_OUTPUT");
// 			break;
// 	};
// }, false);

var start,
	counter = 0,
	times = [],
	fps = 1000/60;

var update = function(timestamp) {
	times.push(timestamp-start);
	
	var profilerSession = ps.createSession();
	e.fire("PROFILER_START_BENCHMARK", {id: profilerSession, time: timestamp, type: 0, colour: "#222"});
	e.fire("PROFILER_STOP_BENCHMARK", {id: profilerSession, time: timestamp});

	//previous = timestamp;

	if (++counter > 50) {
		// var previous = times[0];
		// times.forEach(function(time, index) {
		// 	console.log(time-previous);
		// 	previous = time;
		// });
		//console.log(times);
		e.fire("PROFILER_OUTPUT");
		return;
	};

	//window.requestAnimFrame(update);
	setTimeout(function() {
		update(Date.now());
	}, fps)
};

update(start = Date.now());