// Create Parameter Class
var Parameter = function(name, operator, value){
	var self = this;

	// Create DOM
	this.$ =	$("<div>", { "class":"parameter" })

				.append(

					// Delete Button
					$('<span></span>', { "id": "remove", "html": "&times;" }).on("click", function(){
						self.$.remove();
					}),
					
					// Name Input
					( this.name = $('<input>', { "type": "text", "spellcheck": "false", "autoComplete": "off", "id": "name", "value": name, "style": "width:1px;", "list": "names" }) ),

					// Operator Input
					( this.operator = $('<input>', { "type": "text", "spellcheck": "false", "autoComplete": "off", "id": "operator", "value": operator, "style": "width:1px;" }) ),

					// Value Input
					( this.value = $('<input>', { "type": "text", "spellcheck": "false", "autoComplete": "off", "id": "value", "value": value, "style": "width:10px;" }) )

				)


	/* Bind Events to Inputs*/

	.on({

		"keydown": function(e){

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
		},

		"blur": function(e){
			autoComplete.$.hide();
		},

		"input": function(e) {


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

		}

	}, "input");


	this.name
	.on("focus", function(e){
		autoComplete.targetInput(e.target).setLis( datalists.names ).show( $(this).offset() );
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