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