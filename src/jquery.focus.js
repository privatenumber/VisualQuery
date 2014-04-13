$.fn.focus = function( data, fn ){
	'use strict';
	if( !this[0] ){ return; }

	// Set Selection
	if( arguments.length>=1 && Array.prototype.every.call(arguments, function(e){
		return Math.floor(e) === e && $.isNumeric(e);
	}) ){

		if ( this[0].setSelectionRange ){
			return this[0].setSelectionRange(data, fn || data);
		} else if (this[0].createTextRange ){
			var range = this[0].createTextRange();
			range.collapse(true);
			range.moveEnd('character', fn || data);
			range.moveStart('character', data);
			range.select();
		}
	
	} else
	if( arguments.length === 2 ){
		return this.on( "focus", null, data, fn );
	}

	return this.trigger("focus");
};