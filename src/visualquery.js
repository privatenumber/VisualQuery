import "jquery.focus.js";

/* VisualQuery.js v0.1 | github.com/hirokiosame/VisualQuery */
$.fn.visualquery = function(options){
	'use strict';

	// Validate Options
	options	 =	$.extend({
					strict: false,
					parameters: [],
					defaultQuery: [],
					placeholder: "",
					callback: $.noop(),
				}, options);

	var

	// Callback
	callback =	function(){
					options.callback( collection.list.map(function(e){
						return e.validate() && {
							name: e.name.val(),
							operator: (datalists[e.name.val()+"_operators"] && datalists[e.name.val()+"_operators"][e.operator.val()]) || e.operator.val(),
							value: (datalists[e.name.val()+"_values"] && datalists[e.name.val()+"_values"][e.value.val()]) || e.value.val()
						};
					}).filter(function(e){ return e; }) );
				},

	// Placeholder Text
	placeholder =	$("<div></div>", {
						"class": "placeholder",
						"text": options.placeholder,
						"style": "pointer-events: none; display:none;"
					}),

	// Div Container For Parameters
	container =	$("<div>", { "class": "parameters", "html": placeholder })
						.on({
							// Toggle Class - Focus
							"focusin": function(){
								container.addClass("selected");
							},

							// Toggle Class - Blur
							"focusout": function(){
								container.removeClass("selected");
							},

							// Click to Create a New Parameter
							"mousedown": function(e){

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

								// Update Collection
								collection.update();
							}
						}),

	// Collection of Parameters
	collection =	{
						list: [],
						update: function(){
							var self = this, children = container.children("div.parameter");
							this.list = [];

							// Toggle Placeholder
							placeholder[ children.length ? "hide" : "show" ]();

							children.each(function(){
								self.list.push( $(this).data("Parameter") );
							});

							return this;
						}
					},

	// Defined Parameters
	parameters	= {},

	// Datalist for Autocomplete
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

	// Autocomplete
	import "visualquery.autoComplete.js";
	
	// Parameters
	import "visualquery.parameters.js";


	// Render Visual Query
	this.html([container, autoComplete.$]);

	// Render Default Query Set in Options
	options.defaultQuery.filter(function(parameter){

		// If Strict and Not in Parameters
		if( options.strict && !(parameter.name in parameters) ){ return; }

		// Put it in Query
		parameter = new Parameter(parameter.name, parameter.operator, parameter.value, parameter.type );
		parameter.$.appendTo(container);

		parameter.name.trigger("blur").trigger("adjustWidth");
		parameter.operator.trigger("adjustWidth");
		parameter.value.trigger("adjustWidth");

		// Update Collection
		collection.update();

		return true;
	}).length || placeholder.show();

	callback();
};