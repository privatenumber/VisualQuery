$.fn.focus = function( data, fn ){


	// 2 Arguments - Selection

	// 1 Argument
	// 	If function -- Bind callback
	//	If Numeric -- Caret Position

	// 0 Arguments - Trigger


	'use strict';	
	if( !this[0] ){ return; }

	// Set Selection
	if( arguments.length>=1 && Array.prototype.every.call(arguments, function(e){
		return Math.floor(e) === e;
	}) ){


		if ( this[0].setSelectionRange ){

			// Beacause of Chrome removing Select API on inputs
			try {
				this[0].setSelectionRange(data, fn || data);
			}
			catch(e) { }
			// this[0].focus()
			return this.trigger("focus");
		}

		// Internet Explorer
		else if (this[0].createTextRange ){
			var range = this[0].createTextRange();
			range.collapse(true);
			range.moveEnd('character', fn || data);
			range.moveStart('character', data);
			range.select();
		}
	
	}

	// Bind Event
	else if( arguments.length === 2 ){
		return this.on( "focus", null, data, fn );
	}

	// Trigger Event
	return this.trigger("focus");
};