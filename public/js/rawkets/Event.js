/**************************************************
** EVENT DISPATCHER
**************************************************/

// Global event dispatcher to decouple objects and events
// Based on the Obsersver pattern from http://stackoverflow.com/questions/4458712/custom-events-observer-pattern

r.namespace("Event");
rawkets.Event = {
	handlers : {},
	listen: function (event, handler) {
		if (typeof(r.Event.handlers[event]) == "undefined")
			r.Event.handlers[event] = []; 
	
		r.Event.handlers[event].push(handler);
	},
	fire: function (eventName, data) {
		//console.log("Fire event", eventName);
		if (r.Event.handlers[eventName]) {
			for (var i = 0; i < r.Event.handlers[eventName].length; i++) {
				r.Event.handlers[eventName][i](data);
			};
		};
	}
};