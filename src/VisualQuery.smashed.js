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
			try { return this[0].setSelectionRange(data, fn || data); }
			catch(e) { return this.trigger("focus"); }
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
	placeholder = $("<div></div>", { "class": "placeholder", "style": "pointer-events: none;"+(options.defaultQuery.length ? "display:none":""), "text": options.placeholder }),

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
	// Create autoComplete Class
	var autoComplete = (function(){
		var input, datalist, padding,
	
			// Render autoComplete List
			el = $("<ul>", { "class" : "autoComplete" })
	
					// Immutable Autocomplete CSS
					.css({
						'position': 'absolute',
						'display': 'none'
					})
	
					// Hover implemented in CSS because '.selected' is an identifier
					.on("mouseover", "li", function(){
	
						var select = $(this).addClass("selected");
	
						// Remove Class
						select.siblings(".selected").removeClass("selected");
	
						// Set Placeholder
						input.attr("placeholder", select.attr("value")).trigger("adjustWidth");
					})
	
					// Can't be click because input will be blurred & dropdown will disappear
					.on("mousedown", "li", function(e){
						e.preventDefault();
	
						input
							.removeAttr("placeholder")
							.val( $(this).attr("value") )
							.trigger("input")
							.blur()
							.next().focus();
					}),
	
			// Render the Lis so it matches the Input Value
			renderLis = function(){
	
				console.log(el.children());
				var index = el.children(".selected").index(),
					select = index !== -1 ? index : 0,
					list =	datalist.map(function(li, idx){
								// If Typed Doesn't match, Don't show
								if( !li.match(new RegExp(input.val(), "i")) ){ return; }
	
								return $("<li>", {
									"text": li,
	
									//Automatically Select First one
									"class": ( select === idx ? (input.attr("placeholder", li).trigger("adjustWidth") && "selected") : "" )
								}).attr("value", li);
							}).filter(function(elem){ return elem; });
	
	
				// Dynamic Padding adapting to CSS
				padding = padding || parseInt(el.find("li").css("padding-left"));
	
				return ( list.length ? el.html(list).show() : el.hide() );
			};
	
	
		return {
	
			// DOM Element
			$: el,
	
			// Set Target Input
			// Pass in Input Element so that it can enter values when li is clicked
			targetInput: function(target){
				// var self = this;
				return	( input = $(target).on({
							"input": renderLis.bind(this),
							"blur": function(){ $(this).unbind("keydown input"); },
							"keydown": function(e){
	
								var input = $(this), selected;
	
								// Enter
								if( e.keyCode === 13 ){
									e.preventDefault();
	
									// If Dropdown is selected, use selected
									e = el.is(":visible") && (selected = el.children(".selected")).length === 1 &&
										input.val( selected.attr("value") ).trigger("input");
									
	
									// Blur regardless of the existence of following input and Focus Next Input
									var next = input.blur().next();
	
									if( next.length ){
										next.focus();
									}else{
	
										// Parameter
										(next = new Parameter()).$.appendTo(container);
										next.name.focus();
	
										// Update Collection
										collection.update();
									}
								}
	
								// Down / Up
								if( el.is(":visible") && (e.keyCode === 40 || e.keyCode === 38) ){
									e.preventDefault();
									var direction = e.keyCode === 40 ? "next" : "prev";
	
									// If Select is Found
									return ( selected = el.children(".selected") )[direction]().length &&
	
										// Select Next or Previous One
										( selected = selected.removeClass("selected")[direction]().addClass("selected") ) &&
	
										// Set Placeholder													
										input.attr("placeholder", selected.attr("value")).trigger("adjustWidth");
								}
	
							}
						}) ) && this;
			},
	
			// Create List
			setLis: function(setLis){
				return (datalist = $.isArray(setLis) ? setLis : Object.keys(setLis) ) && renderLis() && this;
			},
	
			// Set Offset of Dropdown
			show: function(offset){
	
				// Don't display if there's nothing to display
				if( datalist.length === 0 ){ return; }
	
				// jQuery can't properly set the offset of a hidden element; show first
				el
					.show()
					.offset({
						top:offset.top+input.height(),
						left:offset.left  - (padding || 0)
					});
			}
		};
	})();
	
	// Parameters
	// Caret Methods for Parameter
	var
	caretLeft = function(el){
					try{
						return el.selectionStart === 0 && el.selectionEnd === 0;
					}catch(e){
						return false;
					}
				},
	caretRight = function($, el){
					try{
						return ( $.val().length === el.selectionStart && $.val().length === el.selectionEnd );
					}catch(e){
						return false;
					}
				};
	
	// Create Parameter Class
	var Parameter = function(name, operator, value){
		var self = this;
	
		// Remove Parameter
		this.remove = function(){
	
			// Remove Parameter
			self.$.remove();
	
			// Update Collection
			collection.update();
	
			// Invoke Callback
			callback();
		};
	
		// Validation
		this.validate = function(){
	
			// Values
			var name = self.name.val(), operator = self.operator.val(), value = self.value.val();
	
			// If All Empty
			if( !(name+operator+value).length ){
				return self.remove() && false;
			}
	
			// If Any of them is Empty
			if(
				!name.length		||
				!operator.length	||
				!value.length
			){
				self.$.addClass("error");
				return false;
			}
	
			// Invalid name && Strict => Error
			if( options.strict && !parameters.hasOwnProperty(name) ){
				return self.$.addClass("error").attr("title", "Invalid Parameter") && false;
			}
	
			// Input Type Constraint
			if( !self.value[0].checkValidity() ){
				return self.$.addClass("error").attr("title", self.value[0].validationMessage) && false;
			}
	
			// Valid
			return true;
		};
	
		// Create DOM
		this.$ =	$("<div>", { "class":"parameter" })
	
					.data("Parameter", this)
	
					.append(
	
						// Delete Button
						$('<span></span>', { "id": "remove", "html": "&times;" }).on("click", self.remove),
						
						// Name Input
						( this.name =	$('<input>', { "type": "text", "spellcheck": "false", "autoComplete": "off", "id": "name", "value": name, "style": "width:1px;" })
											.on({
													"focus": function(){
	
														// Render Autocomplete
														autoComplete
															.setLis( datalists.names )
															.show( $(this).offset() );
													},
	
													"blur": function(){
	
														var name = self.name.val(),
															settings = parameters[name] || {};
	
														// Change Operator Attributes
														self.operator.attr( jQuery.extend(
															// Default
															{ "placeholder": "" },
	
															// User Preferences
															settings.operatorAttrs || {},
	
															// Immutable Attributes
															{
																"type": "text"
															})
														).trigger("input");
														
	
														// Change Value Attributes
														self.value.attr( jQuery.extend(
															// Default
															{ "placeholder": "" },
	
															// User Preferences
															settings.valueAttrs || {},
	
															// Immutable Attributes
															{
																"type":
																	// Allowed Types
																	( ["text", "email", "number", "url"].indexOf(settings.type) !==-1 && settings.type ) ||
	
																	// Fallback Type
																	"text"
															}
														) ).trigger("input");
													}
												})
						),
	
						// Operator Input
						( this.operator =	$('<input>', { "type": "text", "spellcheck": "false", "autoComplete": "off", "id": "operator", "value": operator, "style": "width:1px;" })
												.on("focus", function(){
													// Render Autocomplete
													autoComplete
														.setLis( datalists[self.name.val()+"_operators"] || [] )
														.show( $(this).offset() );
												})
						),
	
						// Value Input
						( this.value =	$('<input>', { "type": "text", "spellcheck": "false", "autoComplete": "off", "id": "value", "value": value, "style": "width:10px;" })
											.on("focus", function(){
												// Render Autocomplete
												autoComplete
													.setLis( datalists[self.name.val()+"_values"] || [] )
													.show( $(this).offset() );
											})
						)
					)
	
		// Move to Next Input
		.on("keydown", "input#name", function(e){
			// Left: If the Caret is at the beginning of the input
			if(
				caretLeft(this) &&
	
				// Left - 37
				e.keyCode === 37
			){
				e.preventDefault();
	
				// Focus Previous Parameter
				var previous = collection.list[ collection.list.indexOf(self)-1 ];
				previous = previous && previous.value.focus();
			}
		})
	
		// Move to Previous Input
		.on("keydown", "input#value", function(e){
			// Right: If the Caret is at the end of the input
			if(
				caretRight($(this), this) &&
	
				// Right - Go to Next Input
				e.keyCode === 39
			){
				e.preventDefault();
	
				// Focus Next Parameter
				var next = collection.list[ collection.list.indexOf(self)+1 ];
				next = next && next.name.focus(0);
			}
		})
	
		// Bind Events to Inputs
		.on({
	
			"keydown": function(e){
	
				var input = $(this);
	
				if(
					// Right: If the Caret is at the end of the input
					caretRight(input, this) &&
	
					// Right - Go to Next Input
					e.keyCode === 39
				){
					e.preventDefault();
					input.next().focus(0);
				}
	
				// Left: If the Caret is at the beginning of the input
				if(
					caretLeft(this) &&
					(
						// Left - 37
						e.keyCode === 37 ||
	
						// Delete - 8
						e.keyCode === 8
					)
				){
					e.preventDefault();
					input.prev().focus();
				}
	
			},
	
			"blur": function(){
	
				// Remove Selected Class from Parameter
				self.$.removeClass("selected");
	
				// Validate
				self.validate();
	
				// Hide Auto Complete
				autoComplete.$.hide();
	
				// Invoke Callback
				callback();
			},
	
			"focus": function(){
	
				// Add Selected Class to Parameter
				self.$.removeClass("error").addClass("selected");
	
				// Bind AutoComplete
				autoComplete.targetInput(this);
			},
	
			"input adjustWidth": function(){
	
				// Dynamic Input Width 
	
				// Padding for HTML5 Types
				var padding = {
					"number" : 17
				};
	
				var $this = $(this),
					value = $this.val(),
	
					// Use Placeholder if there's no text
					useText = ( value.length !== 0 ? value : ( $this.attr("placeholder") || "" ) );
	
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
										$this.css([
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
	
				// Set Width
				$this.width(
	
					// Width of Shadow + Fallback Width for Empty Inputs
					(width || 10 ) +
	
					// Width of Caret
					1 +
	
					// HTML5 Type Padding
					(padding[$this.attr("type")] || 0)
				);
	
			}
		}, "input");
	};


	// Render Visual Query
	this.html([container, autoComplete.$]);

	// Render Default Query Set in Options
	options.defaultQuery.forEach(function(parameter){

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
	});

	callback();
};