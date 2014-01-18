/* Dynamic Input Width jQuery Plugin v0.1 | github.com/hirokiosame/dynamicInputWidth */
$.fn.dynamicInputWidth=function(a){var c=this instanceof jQuery?this:$(this);if(!c.is("input"))return this;a=$.extend({returnWidth:!1,context:"body",placeholder:!0,useInputStyle:!0,minWidth:1,"class":"",css:{}},a);var b=c.val(),d=a.placeholder?c.attr("placeholder")||"":"";if(0===b.length+d.length)return c.width(a.minWidth),this;b=b.length>d.length?b:d;b=$("<span>",{"class":a["class"]}).css(jQuery.extend({width:"auto",visibility:"hidden",whiteSpace:"nowrap"},a.useInputStyle?c.css("font-size font-family font-weight font-style font-variant word-spacing letter-spacing text-indent text-rendering text-transform".split(" ")):{},a.css)).text(b).appendTo(a.context);d=b.width();b.remove();return a.returnWidth?d:c.width(d)};


/* VisualQuery.js v0.1 | github.com/hirokiosame/VisualQuery */
$.fn.search = function(options){
	'use strict';

	var container = $("<div>", { "class": "parameters" }),
		searchBar = this.replaceWith($("<div>", { "class": "search" }).html(container)),
		parameters = {},
		query = [],

		// Validate Options
		options =	$.extend({
						strict: false,
						parameters: [],
						defaultQuery: [],
						callback: $.noop()
					}, options),

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


	// Create Autocomplete Class
	var autoComplete = (function(options, container){
		var input, lis;

		return {

			// Create DOM
			$: $("<ul></ul>", {"class":"autoComplete"})

					// Hover implemented in CSS because '.selected' is an identifier
					.on("mouseover", "li", function(){

						// Remove Selected
						$(this).siblings(":has(.selected)").children("a").removeClass("selected");

						// Select
						$("a", this).addClass("selected");
					})

					// Can't be click because input will be blurred
					.on("mousedown", "a", function(e){
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

					return $("<a></a>", {
						//Automatically Select First one
						"class": ( ( options.strict === true && first === false && (first = true) ) ? "selected" : "" )
					}).attr("value", li).text(li).wrap("<li>").parent();
				}));

				// Dynamic Padding adapting to CSS
				this.padding = this.padding || parseInt(this.$.find("li>a").css("padding-left"));
			},

			// Set Offset of Dropdown
			offset: function(left){
				this.$.offset({left:left  - (this.padding || 0)});
			}
		};
	})(options, container);


	// Create Parameter Class
	var Parameter = function(name, operator, value){
		this.name = $("<input>", { "class": "name", "value": name }).dynamicInputWidth({context: container, "class": "name inputBlurred", useInputStyle: false});
		this.operator = $("<input>", { "class": "operator", "value": operator  }).dynamicInputWidth({context: container, "class": "inputBlurred", useInputStyle: false});
		this.value = 	$("<input>", { "class": "value", "value": value  }).dynamicInputWidth({context: container, "class": "inputBlurred", useInputStyle: false});

		this.$ =	$("<div>", { "class":"parameter" })
						.append('<div class="remove"></div>', this.name, this.operator, this.value);

		this.bind();
	};

	// Display as Object
	Parameter.prototype.toObj = function() {
		if( this.$.hasClass("error") || !this.$ ){ return false; }
		return { name: this.name.val(), operator: this.operator.val(), value: this.value.val() };
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
		var self = this;
		this.$

		// Remove
		.on("click", "div.remove", self.remove.bind(self))

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
				self.name.val().length === 0 ^

				// 101 - Error
				(self.value.val().length > 0 && self.operator.val().length === 0) ||

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
				return self.$.addClass("error");
			}
		})

		// On Input Focus
		.on("focus", "input", function(e){

			var input = $(e.target);

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
			autoComplete.offset(input.offset().left);
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

				input.blur().next("input").focus();
			}

			/*
			// Up - for Autocomplete
			if( e.keyCode === 38 ){
				console.log("Up");
			}

			// Down - for Autocomplete
			if( e.keyCode === 40 ){
				console.log("Down");
			}
			*/
		})

		// On Input Keyup
		.on("keyup", "input", function(e){
			// Render new Autocomplete
			autoComplete.renderLis();
		});
	};


	// Render Default Query Set in Options
	options.defaultQuery.forEach(function(parameter){
		// If Strict and Not in Parameters
		if( options.strict && !(parameter.name in parameters) ){ return; }

		// Put it in Query
		query[query.push(new Parameter(parameter.name, parameter.operator, parameter.value ))-1].$.appendTo(container);
	});


	// Bind Events to the Container
	container

	// Click to Create a New Parameter
	.on("mousedown", function(e){

		// Ignore Event Bubbling
		if( !$(e.target).is(container) ){ return; }

		// Prevent so the Input Focuses
		e.preventDefault();

		// Unselect Selected Prameters
		$("div.parameter.selected", container).removeClass("selected");

		// Determine insert location
		var before;
		$("div.parameter", container).each(function(){
			var position = $(this).offset();
			if( position.left > e.pageX ){
				before = $(this);

				// Break Loop
				return false;
			}
		}); 

		// Create Parameter
		var parameter = query[query.push(new Parameter())-1];

		if( before !== undefined ){	before.before(parameter.$); }
		else{						parameter.$.appendTo(this);	}

		// Focus Parameter Input
		parameter.$.find("input.name").focus().val("");

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

		// Change Width of Input
		input.dynamicInputWidth({context: container, "class": input.attr("class") + " inputBlurred", useInputStyle: false});

		// Invoke Callback
		callback();
	})

	// On Input Focus -- resize
	.on("focus", "input", function(e){
		var input = $(this);

		// Change Width of Input
		input.dynamicInputWidth({context: container, "class": "inputFocused", useInputStyle: false});

		// Set Select Class on Parameter
		var parent = input.parent("div.parameter");
		!parent.hasClass("selected") && $("div.parameter.selected", container).removeClass("selected") && parent.addClass("selected");

	})

	// On Parameter Mousedown -- Select
	.on("mousedown", "div.parameter", function(e){

		var parameter = $(this),
			target = $(e.target);


		// Add Class Selected
		if( !parameter.hasClass("selected") ){
			e.preventDefault();	//So doesn't focus the input
			$("input:focus", container).blur();
			$("div.parameter.selected", container).removeClass("selected");
			return parameter.addClass("selected");
		}

		// Given it has the class Now, Toggle Selected
		if( target.is(parameter) ){ return parameter.removeClass("selected"); }

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

	// Keyboard Events
	//$(document).on("keydown", function(e){
		//console.log("keydown", e);
		// Select Multiple Parameters on Shift
		// Delete Selected Parameters on Delete Key
		// Shift Select with Arrow Keys
	//});
	
};