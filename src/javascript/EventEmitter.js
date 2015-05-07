module.exports = (function(){

	'use strict';

	function EventEmitter(){
		this._events = {};
	}

	EventEmitter.prototype.emit = function(eName){

		// Return if not exist
		if( !this._events[eName] ){ return false; }

		var args = [].slice.apply(arguments, [1]);

		// Trigger each
		this._events[eName].forEach(function(cb){ cb.apply(window, args); });
	};

	EventEmitter.prototype.on = function(eName, callback){

		// Add callback
		( this._events[eName] || (this._events[eName] = []) ).push(callback);

		return this;	
	};

	return EventEmitter;

})();