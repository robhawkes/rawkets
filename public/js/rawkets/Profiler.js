/**************************************************
** PEFORMANCE PROFILER
**************************************************/

// Todo: Find a way to automatically start and stop an individual
// 		 benchmark without passing around or manually setting IDs.

r.namespace("Profiler");
rawkets.Profiler = function() {
	// Shortcuts
	var e = r.Event;

	var dataByType = [],
		data = [],
		types = {
			GAME_UPDATE_LOOP: 0,
			PHYSICS_UPDATE: 1,
			GAME_CLOCK: 2,
			UPDATE_PLAYER_STATES: 3,
			PLAYER_HISTORY_CORRECTION: 4,
			DRAW_UPDATE: 5
		};
		typeTitles = {
			GAME_UPDATE_LOOP: "Game update loop",
			PHYSICS_UPDATE: "Physics updates",
			GAME_CLOCK: "Initialise game clock",
			UPDATE_PLAYER_STATES: "Update player states",
			PLAYER_HISTORY_CORRECTION: "Correcting player history",
			DRAW_UPDATE: "Drawing the game scene"
		};
	
	function dataById(id) {
		var i, dataCount, elem;
		dataCount = dataByType.length;
		for (i = 0; i < dataCount; i++) {
			elem = dataByType[i];
			if (elem.id == id) {
				return elem.data;
			};
		};

		return false;
	};

	function init() {
		for (key in types) {
			dataByType.push({id: types[key], data: []});
		};

		e.listen("PROFILER_START_BENCHMARK", onStartBenchmark);
		e.listen("PROFILER_STOP_BENCHMARK", onStopBenchmark);
		e.listen("PROFILER_OUTPUT", onOutput);
	};
	
	function onStartBenchmark(event) {
		// Add to array of all data types
		var allIndex = data.push({
			id: event.id,
			startTime: event.time,
			type: event.type,
			colour: event.colour
		});

		var dataArray;
		switch (event.type) {
			case types.GAME_UPDATE_LOOP:
				dataArray = dataById(types.GAME_UPDATE_LOOP) || false;
				break;
			// case types.PHYSICS_UPDATE:
			// 	dataArray = dataById(types.PHYSICS_UPDATE) || false;
			// 	break;
			// case types.GAME_CLOCK:
			// 	dataArray = dataById(types.GAME_CLOCK) || false;
			// 	break;
		};

		if (dataArray) {
			dataArray.push({
				id: event.id,
				allIndex: allIndex-1,
				startTime: event.time,
				colour: event.colour
			});
		};
	};
	
	function onStopBenchmark(event) {
		var dataArray;
		switch (event.type) {
			case types.GAME_UPDATE_LOOP:
				dataArray = dataById(types.GAME_UPDATE_LOOP) || false;
				break;
		};

		(function() {
			var i, dataCount, elem;
			if (dataArray) {
				dataCount = dataArray.length-1;
				for (i = dataCount; i >= 0; i--) {
					elem = dataArray[i];
					if (elem.id == event.id) {
						elem.stopTime = event.time;
						return;
					};
				};
			};
		})();

		// Add to array of all data types
		dataCount = data.length-1;
		for (i = dataCount; i >= 0; i--) {
			elem = data[i];
			if (elem.id == event.id) {
				elem.stopTime = event.time;
				return;
			};
		};
	};

	function onOutput() {
		console.log("var data = "+JSON.stringify(data)+";var dataByType = "+JSON.stringify(dataByType)+";");
	};

	return {
		init: init
	};
};

r.namespace("ProfilerSession");
rawkets.ProfilerSession = {
	createSession: function() {
		return Date.now().toString()+(Math.round(Math.random()*100)).toString();
	}
};