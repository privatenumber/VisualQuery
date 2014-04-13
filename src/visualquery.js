import "jquery.focus.js";

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


import "visualquery.autoComplete.js";
import "visualquery.parameters.js";


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
	this.html([container, autoComplete.$]);

};