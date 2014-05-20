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