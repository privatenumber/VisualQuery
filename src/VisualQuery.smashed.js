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

/* VisualQuery.js v0.1 | github.com/hirokiosame/VisualQuery */
$.fn.visualquery = function(options){
	'use strict';

	// Validate Options
	options		=	$.extend({
						strict: false,
						parameters: [],
						defaultQuery: [],
						callback: $.noop(),
					}, options);

	var

	// Div Container For Parameters
	container	= $("<div>", { "class": "parameters" }),

	// Defined Parameters
	parameters	= {},

	// Current Query
	query		= [],

	// Callback
	callback =	function(){
					var json = [];
					query.forEach(function(e){
						var obj = e.toObj();
						if(obj){ json.push(obj); }
						return e.toObj();
					});
					options.callback(json);
				},

	datalists = {
		names: []
	};


	// Transpose Parameter Options
	options.parameters.forEach(function(parameter){
		parameters[parameter.name] = parameter;

		// Datalist: Names
		datalists.names.push(parameter.name);

		// Datalist: Operators
		datalists[parameter.name+"_operators"] = parameter.operators && parameter.operators;

		// Datlist: Values
		datalists[parameter.name+"_values"] = parameter.values && parameter.values;
	});
	
	// Generate Datalists

var autocomplete = (function(){
	var a$ = $("<ul></ul>"),
		options = [];



	return {

		lis: function(opts){

		},
		input: function(){

		},
		hide: function(){

		},
		show: function(){

		}

	};
})();

// Create Parameter Class
var Parameter = function(name, operator, value){
	var self = this;

	// DOM
	this.$ =	$("<div>", { "class":"parameter" })

				.append(

					// Delete Button
					$('<span></span>', { "id": "remove", "html": "&times;" }).on("click", function(){
						self.$.remove();
					}),
					
					// Name Input
					( this.name = $('<input>', { "type": "text", "spellcheck": "false", "autocomplete": "off", "id": "name", "value": name, "style": "width:1px;", "list": "names" }) ),

					// Operator Input
					( this.operator = $('<input>', { "type": "text", "spellcheck": "false", "autocomplete": "off", "id": "operator", "value": operator, "style": "width:1px;" }) ),

					// Value Input
					( this.value = $('<input>', { "type": "text", "spellcheck": "false", "autocomplete": "off", "id": "value", "value": value, "style": "width:10px;" }) )

				)

				// On Input Keydown
				.on("keydown", "input", function(e){

					var input = $(e.target);

					// Enter
					if( e.keyCode === 13 ){

						input.next().focus();
						// //If one of the dropdown options are selected, use that
						// var selected = autoComplete.$.find(".selected");
						// if( selected.length === 1){
						// 	input.val(selected.attr("value"));
						// }

						// return focusNext(input);
					}
				})

				.on("blur", "input", function(e){

					// autocomplete.hide();
				})

				.on("input", "input", function(e) {


					// Padding for HTML5
					var padding = {
						"number" : 17,
						"date": 57
					};

					var self = $(this),
						value = self.val(),
						useText = ( value.length !== 0 ? value : ( self.attr("placeholder") || "" ) );

					console.log(value, value.length, self.attr("type"));


					// If No Length
					//if( useText.length === 0 ){ return self.width( (padding[self.attr("type")] || 0) + 1 + (self.attr("list") !== undefined ? 20 : 0) ); }

					// Render Shadow to Get Width
					var shadow	=	$("<span>", { "class": options['class'] })
										.css(jQuery.extend(

											// Default Shadow CSS
											{
												position: 'absolute',
												width: 'auto',
												visibility: 'hidden',
												whiteSpace: 'pre'
											},

											// Use Input CSS?
											self.css([
												'font-size',
												'font-family',
												'font-weight',
												'font-style',
												'font-variant',
												'word-spacing',
												'letter-spacing',
												'text-indent',
												'text-rendering',
												'text-transform'
											])
										))
										.text(useText)
										.appendTo(container),
						width	=	shadow.width();

					// Remove Shadow
					shadow.remove();


					// Add Padding if it has "list"



					// Set Width
					// Add 1px for Caret
					self.width( width + (padding[self.attr("type")] || 0) + 1 + (self.attr("list") !== undefined ? 20 : 0) );

					// Autocomplete
					autocomplete.input();
				})
				;

	this.name

	.on("focus", function(){
		console.log("Open autoComplete");
		// autocomplete.lis(datalist['names']).show();


	})
	.on("blur", function(){


		var name = self.name.val();

		var settings = parameters[name] || {};

		// Change Operator Attributes
		self.operator.attr( jQuery.extend(
			// Default
			{ "placeholder": "" },

			// User Preferences
			settings.operatorAttrs || {},

			//	Locked
			//		Note - Make Class mandatory..?
			{
				"type": "text",
				"list": name
			})
		).trigger("input");
		

		// Change Value Attributes
		self.value.attr( jQuery.extend(
			// Default - Gets Resetted if Settings Doesn't Exist
			{ "type": "text", "placeholder": "" },

			// User Preferences
			settings.valueAttrs || {},

			// Locked
			{
				"type": settings.type || ( settings.valueAttrs && settings.valueAttrs.type) || "text",
				"list": name+"_values"
			}
		) ).trigger("input");

		// Change Input Widths

		// Not valid name && Strict => Error
		if( options.strict && !parameters.hasOwnProperty(name) ){ return "Error"; }

	});


	// Enforce Type Constaint Validation
	this.value.on("blur", function(){
		//console.log( self.value[0].willValidate, self.value[0].validity, self.value[0].validationMessage, self.value[0].setCustomValidity() );
		if( !self.value[0].checkValidity() ){
			self.$.addClass("error");
		}else{
			self.$.removeClass("error");
		}
	})
	;

};


	// Render Default Query Set in Options
	options.defaultQuery.forEach(function(parameter){

		// If Strict and Not in Parameters
		if( options.strict && !(parameter.name in parameters) ){ return; }

		// Put it in Query
		parameter = new Parameter(parameter.name, parameter.operator, parameter.value, parameter.type );
		parameter.$.appendTo(container);
	});



	// //
	// $(document).on("click", function(e){
	// 	var target = $(e.target);

	// 	// If it's the container or inside the container
	// 	if( target.is(container) || container.has(target).length!==0 ){
	// 		container.addClass("selected");
	// 	}else{
	// 		// Remove Select from Visual Query
	// 		container.removeClass("selected");

	// 		// Unselect Selected Prameters
	// 		$("div.parameter.selected", container).removeClass("selected");
	// 	}
	// });



	container

	// Focus
	.on("focusin", function(){
		container.addClass("selected");
	})
	.on("blur", "input", function(){
		container.removeClass("selected");
	})
	

	// Click to Create a New Parameter
	.on("mousedown", function(e){

		// Ignore Event Bubbling
		if( !$(e.target).is(container) ){ return; }

		// Prevent so the Input Focuses
		e.preventDefault();

		// Unselect Selected Prameters
		$("div.parameter.selected", container).removeClass("selected");

		// Determine insert location
		var after;
		$("div.parameter", container).each(function(){

			var $this = $(this),
				position = $this.offset();

			if(
				// Stop Iterating if Row is below
				position.top > e.pageY ||

				// If on row but passed it
				(position.top < e.pageY && e.pageY< position.top+$this.height() && position.left>e.pageX)
			){
				return false;
			}

			after = $this;
		}); 

		// Create Parameter
		var parameter = new Parameter();
		parameter.$[(after !== undefined) ? 'insertAfter' : 'prependTo'](after || this);
		parameter.name.focus();

	})

	;


	// Render Visual Query
	this.html(container);

};
