/**************************************************
** NET GRAPH
**************************************************/

r.namespace("NetGraph");
rawkets.NetGraph = function(width, height) {
	// Shortcuts
	var e = r.Event;

	// Properties
	var width = width,
		height = height,
		//maxPing = 200,
		maxData = 500,
		//pings = [],
		//tmpData = [],
		data = [],
		lastUpdateTime = Date.now();
		//packetsPerUpdate = 0,
		//charsPerUpdate = 0; // This is actually characters per second, not bytes

	var init = function() {
		e.listen("SOCKET_MESSAGE", onSocketMessage);
		//e.listen("PING", onPing);
	};

	var onSocketMessage = function(packet) {
		//addData(JSON.stringify(msg).length);
		addData(packet, Date.now());
	};

	// var onPing = function(msg) {
	// 	addPing(msg.p);
	// 	addData();
	// };
	
	// var addPing = function(ping) {
	// 	if (pings.length == width) {
	// 		pings.shift(); // Remove first ping
	// 	};
	
	// 	pings.push(ping);
	// };
	
	var addData = function(packet, time) {
		data.push([packet.length, time]);
	};
	
	var update = function() {
		var time = Date.now(),
			timeDiff = time - lastUpdateTime;

		if (data.length > 0) {
			while (timeDiff > 0) {
				data.push([0, lastUpdateTime+=10])
				timeDiff-=10;
			}
		}

		while (data.length > width) {
			data.shift();
		}

		lastUpdateTime = time;
	};
	
	var draw = function(viewport) {
		var ctx = viewport.ctx;
	
		ctx.save();
		ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
		ctx.fillRect(0, 0, width, height);
		
		ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
		ctx.font = "Bold 8px Verdana";

		// ctx.fillText("0ms", width+4, height-2);
		// ctx.fillText(maxPing+"ms", width+4, 10);
		
		// var ms = (pings.length > 0) ? pings[pings.length-1] : 0;
		// ctx.fillStyle = "rgb(255, 255, 255)";
		// ctx.fillText(ms+"ms", 4, 10);
		
		// ctx.fillText(packetsPerUpdate+" p/u", 4, 25);
		// ctx.fillText(charsPerUpdate+" c/u", 4, 40);
		
		var d, dx, dy, dat, dataCount = data.length;
		if (dataCount > 0) {
			ctx.strokeStyle = "rgb(0, 255, 0)";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(width-(dataCount*2), height-(data[0][0]/(maxData/height)));
			for (d = 0; d < dataCount; d++) {
				dat = data[d][0];
				dx = (width-(dataCount*2))+(d*2);
				dy = height-(dat/(maxData/height));

				ctx.lineTo(dx, dy);
			}
			ctx.stroke();
		}
		
		// var p, px, py, ping, pingCount = pings.length;
		// if (pingCount > 0) {
		// 	ctx.strokeStyle = "rgb(255, 255, 255)";
		// 	ctx.lineWidth = 1;
		// 	ctx.beginPath();
		// 	ctx.moveTo(width-(pingCount*2), height-(pings[0]/(maxPing/height)));
		// 	for (p = 0; p < pingCount; p++) {
		// 		ping = pings[p];
		// 		px = (width-(pingCount*2))+(p*2);
		// 		py = height-(ping/(maxPing/height));

		// 		ctx.lineTo(px, py);
		// 	};
		// 	ctx.stroke();
		// };
		
		ctx.restore();
	};
	
	return {
		init: init,
		update: update,
		draw: draw
	}
};