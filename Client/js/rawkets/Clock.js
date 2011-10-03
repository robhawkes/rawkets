/**************************************************
** CLOCK
**************************************************/

// Based on TimeDelta class by Jobe Makar
r.namespace("TimeDelta");
/**
* Creates a new instance of the TimeDelta class.
* @param	Latency value (1/2 the round trip time)
* @param	TimeSyncDelta
*/
rawkets.TimeDelta = function(latency, timeSyncDelta) {
	// Properties
	var _latency = latency,
		_timeSyncDelta = timeSyncDelta;

	var getLatency = function() { return _latency; };
	var getTimeSyncDelta = function() { return _timeSyncDelta; };

	return {
		getLatency: getLatency,
		getTimeSyncDelta: getTimeSyncDelta
	};
};

r.namespace("Clock");
rawkets.Clock = function(message) {
	// Shortcuts
	var e = r.Event,
		ps = r.ProfilerSession,
		TimeDelta = r.TimeDelta;
	
	// Properties

	// Each latency data point
	var _deltas,
	// Max number of deltas to keep track of
 		_maxDeltas = 10,
	// The best computed offset to getTimer based on the information we have
		_syncTimeDelta,
	// True if there is a request out
		_responsePending,
	// Time we sent the request
		_timeRequestSent,
	// Determined latency value
		_latency,
	// Of the data set used, this is the biggest variation from the latency and the furthest value
		_latencyError,
	// True if we are in the initial flurry of pings
		_bursting,
		_lockedInServerTime,
	// Message controller
		_message = message;
	
	// Methods
	
	var start = function() {
		var profilerSession = ps.createSession();
		e.fire("PROFILER_START_BENCHMARK", {id: profilerSession, time: Date.now(), type: 2, colour: "#ff0000"});

		_deltas = [];
		_lockedInServerTime = false;
		_responsePending = false;
		_bursting = true;
		
		// Add event listener here to deal with incoming data from the server
		e.listen("PING", onPing);
		
		requestServerTime(profilerSession);
	};
	
	var stop = function() {
		// Remove event listener that deals with incoming data from the server
	};
	
	var onPing = function(msg) {
		//console.log("Message id "+msg.z+" received at "+new Date().getTime().toString());
		_responsePending = false;

		var serverTimeStamp = msg.t;
		//var serverTimeStamp = msg;
		addTimeDelta(_timeRequestSent, Date.now(), serverTimeStamp);

		if (_bursting) {
			if (_deltas.length == _maxDeltas) {
				_bursting = false;

				e.fire("PROFILER_STOP_BENCHMARK", {id: msg.ps, time: Date.now(), type: 2});
				e.fire("CLOCK_READY", _latency);
				return;
			};
			requestServerTime(msg.ps);
		};
	};
	
	/**
	 * Gets the current server time as best approximated by the algorithm used.
	 * @return The server time.
	 */
	var time = function() {
		var now = Date.now();
		return now + _syncTimeDelta;
	};

	// Private functions
	var requestServerTime = function(profilerSession) {
		if (!_responsePending) {
			_timeRequestSent = Date.now();
			_message.send(_message.format("PING", {ps: profilerSession}), true);
			_responsePending = true;
		};
	};
	
	/**
	 * Adds information to this class so it can properly converge on a more precise idea of the actual server time.
	 * @param	Time the client sent the request (in ms)
	 * @param	Time the client received the response (in ms)
	 * @param	Time the server sent the response (in ms)
	 */
	var addTimeDelta = function(clientSendTime, clientReceiveTime, serverTime) {
		// Guess the latency
		var latency = (clientReceiveTime - clientSendTime) / 2;
		//console.log(clientSendTime, clientReceiveTime, serverTime);

		var clientServerDelta = serverTime - clientReceiveTime;
		var timeSyncDelta = clientServerDelta + latency;
		
		var delta = new TimeDelta(latency, timeSyncDelta);
		_deltas.push(delta);

		if (_deltas.length > _maxDeltas) {
			_deltas.shift();
		}
		
		recalculate();
	};
	
	/**
	 * Recalculates the best timeSyncDelta based on the most recent information
	 */
	var recalculate = function() {
		// Grab a copy of the deltas array
		var tmp_deltas = _deltas.slice(0);
		
		// Sort them lowest to highest
		tmp_deltas.sort(compare);
		
		// Find the median value
		var medianLatency = determineMedian(tmp_deltas);
		
		// Get rid of any latencies that fall outside a threshold
		pruneOutliers(tmp_deltas, medianLatency, 1.5);
		
		_latency = determineAverageLatency(tmp_deltas);
		
		if (!_lockedInServerTime) {
			
			// Average the remaining time deltas
			var avgValue = determineAverage(tmp_deltas);
			
			// Store the result
			_syncTimeDelta = Math.round(avgValue);
			
			_lockedInServerTime = _deltas.length == _maxDeltas;
		};
	};
	
	/**
	 * Determines the average timeSyncDelta based on values within the acceptable range
	 * @param	Array of Time_deltas to be used
	 * @return Average timeSyncDelta
	 */
	var determineAverage = function(arr) {
		var total = 0;
		for (var i = 0; i < arr.length;++i) {
			var td = arr[i];
			total += td.getTimeSyncDelta();
		};
		return total / arr.length;
	};
	
	var determineAverageLatency = function(arr) {
		var total = 0;
		for (var i = 0; i < arr.length;++i) {
			var td = arr[i];
			total += td.getLatency();
		};
		
		var lat = total / arr.length;
		
		_latencyError = Math.abs(arr[arr.length - 1].getLatency() - lat);
		
		return lat;
	};
	
	/**
	 * Removes the values that are more than 1.5 X the median. The idea is that if it is outside 1.5 X the median then it was probably a TCP retransmit and so it should be ignored.
	 * @param	Array of Time_deltas to prune
	 * @param	Median value
	 * @param	Threshold multiplier of median value
	 */
	var pruneOutliers = function(arr, median, threshold) {
		var maxValue = median * threshold;
		for (var i = arr.length - 1; i >= 0;--i ) {
			var td = arr[i];
			if (td.getLatency() > maxValue) {
				arr.splice(i, 1);
			} else {
				//we can break out of the loop because they are already sorted in order, if we find one that isn't too high then we are done
				break;
			};
		};
	};
	
	/**
	 * Determines the median latency value.
	 * @param	Array of Time_deltas to use.
	 * @return Median value.
	 */
	var determineMedian = function(arr) {
		var ind;
		if (arr.length % 2 == 0) { // Even
			ind = arr.length / 2 - 1;
			return (arr[ind].getLatency() + arr[ind + 1].getLatency()) / 2;
		} else { // Odd
			ind = Math.floor(arr.length / 2);
			return arr[ind].getLatency();
		};
		
		return false;
	};
	
	/**
	 * Function used by Array.sort to sort an array from lowest to highest based on latency values.
	 * @param	TimeDelta
	 * @param	TimeDelta
	 * @return -1, 0, or 1
	 */
	var compare = function(a, b) {
		if (a.getLatency() < b.getLatency()) {
			return -1;
		} else if (a.getLatency() > b.getLatency()) {
			return 1;
		};
		
		return 0;
	};	

	return {
		start: start,
		stop: stop,
		time: time
	};
};