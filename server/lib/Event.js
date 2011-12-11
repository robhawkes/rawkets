/**************************************************
** EVENT DISPATCHER
**************************************************/

// Global event dispatcher to decouple objects and events
// Same API but different logic to the local Event dispater class

var events = require("events"),
	eventEmitter = new events.EventEmitter();

var Event = {
	listen: function (event, handler) {
		eventEmitter.on(event, handler);
	},
	fire: function (eventName, data) {
		eventEmitter.emit(eventName, data);
	}
};

exports.Event = Event;