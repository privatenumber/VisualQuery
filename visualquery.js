/* For jQuery 2.x */
$.fn.focus = function( data, fn ){

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

/* Dynamic Input Width jQuery Plugin v0.1 | github.com/hirokiosame/dynamicInputWidth */
$.fn.dynamicInputWidth = function(options) {
	'use strict';

	var self = this instanceof jQuery ? this : $(this);

	// Must be Input
	if( !self.is("input") ){ return this; }


	// Default Options
	options = $.extend({

		// Return Width or this
		returnWidth: false,

		// Context to which the Shadow Input is applied (May be affected by CSS)
		context: "body",

		// Use Placeholder as minimum width?
		placeholder: true,

		// Use Input Style for the Shadow Input
		useInputStyle: true,

		// Min Width of the Shadow Input
		minWidth: 1,

		// Apply a Class to the Shadow Input
		"class": "",

		// Apply CSS to the Shadow Input
		css:	{}
	}, options);


	var value = self.val(),
		placeholder = options.placeholder ? self.attr("placeholder") || "" : "";

	// If No Value
	if( value.length+placeholder.length === 0 ){ self.width(options.minWidth); return this; }

	// Use Value or Placeholder?
	value = (value.length > placeholder.length ? value : placeholder);

	// If Input is unrendered, set to false
	// Cannot be rendered to extract the CSS because the context may not be rendered too
	if( options.useInputStyle && !$(options.context).find(self).length ){
		options.useInputStyle = false;
	}

	var shadow		=	$("<span>", { "class": options['class'] })
						.css(jQuery.extend(

							// Default Shadow CSS
							{
								position: 'absolute',
								width: 'auto',
								visibility: 'hidden',
								whiteSpace: 'pre'
							},

							// Use Input CSS?
							(options.useInputStyle ? self.css([
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
							]) : {} ),

							// Any Extra CSS?
							options.css
						))
						.text(value)
						.appendTo(options.context),
		width		=	shadow.width();


	// Remove Shadow
	shadow.remove();

	// Set Width
	return ( options.returnWidth ? width : self.width( width+1 ) );
};


/* VisualQuery.js v0.1 | github.com/hirokiosame/VisualQuery */
$.fn.visualquery = function(options){
	'use strict';

	var 
		// Validate Options
		options		=	$.extend({
							strict: false,
							parameters: [],
							defaultQuery: [],
							callback: $.noop(),
						}, options),

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
					};
	
	// Transpose Parameter Options
	options.parameters.forEach(function(parameter){
		parameters[parameter.name] = parameter;
	});

	// Render Visual Query
	this.html(container);

	// Create Autocomplete Class
	var autoComplete = (function(options, container){
		var input, lis, padding;

		return {

			// Create DOM
			$: $("<ul>", {"class":"autoComplete"})

					// Hover implemented in CSS because '.selected' is an identifier
					.on("mouseover", "li", function(){

						// Remove Selected
						$(this).siblings(".selected").removeClass("selected");

						// Select
						$(this).addClass("selected");
					})

					// Can't be click because input will be blurred
					.on("mousedown", "li", function(e){
						e.preventDefault();

						input.val($(e.target).attr("value")).blur().next("input").focus();
					})

					// Render
					.insertAfter(container),

			// Set Target Input
			targetInput: function(target){
				input = $(target);
				return this;
			},

			// Create List
			setLis: function(setLis){
				lis = setLis;
				this.renderLis();
				return this;
			},

			// Render Autocomplete List
			renderLis: function(){
				var first = false;
				this.$.html(lis.map(function(li){

					// If Typed Doesn't match, Don't show
					if( !li.match(input.val()) ){ return false; }

					return $("<li>", {
						"text": li,

						//Automatically Select First one if strict
						"class": ( ( options.strict === true && first === false && (first = true) ) ? "selected" : "" )
					}).attr("value", li);
				}));

				// Dynamic Padding adapting to CSS
				padding = padding || parseInt(this.$.find("li").css("padding-left"));
			},

			// Set Offset of Dropdown
			offset: function(offset){
				this.$.offset({top:offset.top+input.height(), left:offset.left  - (padding || 0)});
			}
		};
	})(options, container);


		// Create Parameter Class
		var Parameter = function(name, operator, value){

			// DOM
			this.$ =	$("<div>", { "class":"parameter" }).append(

							// Delete Button
							'<span class="remove">&times;</span>',
							
							// Name Input
							(this.name = $("<input>", { spellcheck: false, "class": "name", "value": name })),

							// Operator Input
							(this.operator = $("<input>", { spellcheck: false, "class": "operator", "value": operator  })),

							// Value Input
							(this.value = $("<input>", { spellcheck: false, "class": "value", "value": value }))
						);

			//collection = collection.add(this.$);

			//console.log(collection, collection.index($(this.$, collection)), "\n\n");


			this.bind();
		};

		// Display as Object
		Parameter.prototype.toObj = function() {
			if( this.$.hasClass("error") || !this.$ ){ return false; }
			return { name: this.name.val(), operator: this.operator.val(), value: this.value.val() };
		};

		// Render
		Parameter.prototype.render = function(method, to){

			// Render
			this.$[method](to);

			// Name Input
			this.name.dynamicInputWidth({context: this.$});

			// Operator Input
			this.operator.dynamicInputWidth({context: this.$});

			// Value Input
			this.value.dynamicInputWidth({context: this.$});
		};

		// Remove
		Parameter.prototype.remove = function() {
			var self = this;

			// Unrender
			this.$.remove();

			// Remove Reference
			query.every(function(e, i){
				if( e.$.is(self.$) ){ delete query[i]; return false; }
				return true;
			});

			// Invoke Callback
			return callback();
		};


		// Bind Events
		Parameter.prototype.bind = function() {
			var self = this,

				// Focus Next
				focusNext = function(input){
					var next = input.blur().next("input");
					return ( next.length === 1 ? next : input.parent().next().find("input:first") ).focus(0);
				},

				// Focus Previous
				focusPrev = function(input){
					var prev = input.prev("input");
					return (prev = ( prev.length === 1) ? prev : input.parent().prev().find("input:last") ) && prev.length && prev.focus(prev.val().length);
				};

			this.$

			// Remove
			.on("click", "span.remove", self.remove.bind(self))

			// On Input Blur
			.on("blur", "input", function(e){

				// Hide Auto Complete
				autoComplete.$.hide();

				// Validation

				// 000 - Remove
				if( self.name.val().length + self.operator.val().length + self.value.val().length === 0 ){
					return self.remove();
				}

				self.$.removeClass("error");

				if(
					// 010 - Error, 001 - Error, 011 - Error
					self.name.val().length === 0 ||

					// 101 - Error
					( self.operator.val().length === 0 && self.value.val().length > 0 ) ||

					// If strict and...
					(options.strict &&
					( 
						// If Name doesn't exist
						!parameters.hasOwnProperty(self.name.val())
						  ||
						(
							// If Operator is Invalid
							self.operator.val().length > 0 && 
							$.inArray(self.operator.val(), parameters[self.name.val()].operators) === -1
						) || (
							// If Value is Invalid
							self.value.val().length > 0 &&
							$.inArray(self.value.val(), parameters[self.name.val()].values) === -1
						)
					))
				){
					self.$.addClass("error");
				}

				// Change Width of Input
				$(this).removeClass("focus").dynamicInputWidth({context: this.$});

				// Change Input Type
				self.value.attr('type', parameters[self.name.val()].type);
				//console.log(self.name.val(), parameters[self.name.val()].type);

			})

			// On Input Focus
			.on("focus", "input", function(e){

				var input = $(this);

				// Change Width of Input
				input.addClass("focus").dynamicInputWidth({context: self.$, "class": "focus"});

				// Create Drop Down
				autoComplete
					.targetInput(input)
					.setLis(	input.is(self.name) ?
									Object.keys(parameters)
								: (	self.name.val() in parameters ?
											parameters[self.name.val()][(input.is(self.operator) ?
												'operators'
											:	'values'
											)]
									: []
								)
					);

				// Display Drop Down
				autoComplete.$.show();
				autoComplete.offset(input.offset());
			})

			// On Input Keydown
			.on("keydown", "input", function(e){

				var input = $(e.target);

				// Enter
				if( e.keyCode === 13 ){

					//If one of the dropdown options are selected, use that
					var selected = autoComplete.$.find(".selected");
					if( selected.length === 1){
						input.val(selected.attr("value"));
					}

					return focusNext(input);
				}

				
				// If the Caret is at the end of the input
				if( input.val().length === input[0].selectionStart && input.val().length === input[0].selectionEnd  ){

					// Right - Go to Next Input
					if( e.keyCode === 39 ){
						e.preventDefault();
						return focusNext(input);
					}


					var lis;

					// Down - for Autocomplete
					if( e.keyCode === 40 ){
						e.preventDefault();

						lis = autoComplete.$.find("li");

						var selected = lis.filter(".selected");

						if( selected.length === 0 ){
							return lis.first().addClass("selected");
						}

						var next = selected.next();
						if( next.length === 1 ){
							return selected.removeClass("selected") && next.addClass("selected");
						}
					}

					// Up - for Autocomplete
					if( e.keyCode === 38 && (lis = autoComplete.$.find("li.selected")).length === 1 ){
						lis.removeClass("selected").prev().addClass("selected");
					}
		
				}

				// If the Caret is at the beginning of the input
				if( input[0].selectionStart === 0 && input[0].selectionEnd === 0 ){

					// Left - 37
					if( e.keyCode === 37 ){
						e.preventDefault();
						return focusPrev(input);
					}

					// Delete - 8
					if( e.keyCode === 8 ){
						e.preventDefault();
						return focusPrev(input);

					}
				}
			})

			// On Input Keyup
			.on("input", "input", function(e){

				// Render new Autocomplete
				autoComplete.renderLis();
			});
		};



	// Render Default Query Set in Options
	options.defaultQuery.forEach(function(parameter){
		// If Strict and Not in Parameters
		if( options.strict && !(parameter.name in parameters) ){ return; }

		// Put it in Query
		query[query.push(new Parameter(parameter.name, parameter.operator, parameter.value, parameter.type ))-1].render("appendTo", container);
	});


	// Bind Events to the Document
	$(document).
	on("click focusin", function(e){
		var target = $(e.target);

		// If it's the container or inside the container
		if( target.is(container) || container.has(target).length!==0 ){
			container.addClass("selected");
		}else{
			// Remove Select from Visual Query
			container.removeClass("selected");

			// Unselect Selected Prameters
			$("div.parameter.selected", container).removeClass("selected");
		}
	});

	// Keyboard Events
	//$(document).on("keydown", function(e){
		//console.log("keydown", e);
		// Select Multiple Parameters on Shift
		// Delete Selected Parameters on Delete Key
		// Shift Select with Arrow Keys
	//});


	// Bind Events to the Container
	container

	// Click to Create a New Parameter
	.on("mousedown", function(e){

		//console.log("container mousedown");

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
		var parameter = query[query.push(new Parameter())-1];

		if( after !== undefined ){	parameter.render("insertAfter", after); }
		else{						parameter.render("prependTo", this);	}

		// Focus Parameter Input
		parameter.$.find("input.name").focus();

	})

	// On Input live value change for resizing
	.on("keydown keypress input", "input", function(e){

		var input = $(e.target);
		if(e.type==="input"){
			input.dynamicInputWidth({context: container, "class": "inputFocused", useInputStyle: false});
		}else
		if( String.fromCharCode(e.which).length>1 ){
			setTimeout(function(){
				input.dynamicInputWidth({context: container, "class": "inputFocused", useInputStyle: false});
			}, 0);
		}
	})

	// On Input Blur -- resize / Callback
	.on("blur", "input", function(e){
		var input = $(this);

		// Invoke Callback
		callback();
	})

	// On Input Focus -- resize
	.on("focus", "input", function(e){
		var input = $(this);


		// Set Select Class on Parameter
		var parent = input.parent("div.parameter");
		!parent.hasClass("selected") && $("div.parameter.selected", container).removeClass("selected") && parent.addClass("selected");

	})

	// Drop Down Events on Scroll
	.on("scroll", function(e){
		var focused = $("input:focus", container);

		// Ignore if there is no Drop Down
		if( focused.length !== 1){ return; }

		var offset = focused.offset(),
			domOffset = container.offset();

		// Hide if input is not visible
		if( offset.left<domOffset.left || offset.left>(domOffset.left + container.width() - focused.width()) ){ autoComplete.$.hide(50); }
		else{ autoComplete.$.show(100); autoComplete.offset(offset.left); }

	});
};