!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.VisualQuery=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = (function(){

	'use strict';

	var EventEmitter = require("EventEmitter");
	var E = require("Element");

	var inputResize = require("./inputResize");



	function Input(name, value){

		// Inherit event emitter
		EventEmitter.apply(this);

		this.type = "text";
		this.name = name;
		
		// Create DOM
		this.$ = E("input", {
					type: "text",
					spellcheck: "false",
					autoComplete: "off",
					"class": name
				})
				.css("width", "1px");

		if( typeof value === "string" ){
			this.$._.value = value;	
		}


		this.bindEvents();
	}

	Input.prototype = Object.create(EventEmitter.prototype);

	Input.prototype.lean = function lean(){
		return this.$._.value || "";
	};

	Input.prototype.previewValue = function previewValue(value){

		this.$
			.attr("placeholder", value)
			.trigger("input");
	};

	Input.prototype.focus = function focus(start){
		this.$.focus(start);
	};

	Input.prototype.changeValue = function changeValue(value){

		// Value
		if( value ){
			this.$._.value = value;	
		}

		// Trigger events
		this.$
			.trigger("input")
			.trigger("blur")
			.trigger("change");

		// Next input
		this.emit("nextInput");
	};

	Input.prototype.bindEvents = function bindEvents(){
		var self = this;

		this.on("rendered", function(){
			self.$.trigger('input');
		});

		this.$
			.on("focus", function(){ self.emit("focus"); })
			.on("blur", function(){
				self.emit("blur");
			})
			.on("change", function(){ self.emit("change"); })
			.on("keydown", function(e){

				// Left: If the Caret is at the beginning of the input
				if(
					this.selectionStart === 0 &&
					this.selectionEnd === 0 &&
					( // Left - 37 or Delete - 8
						e.keyCode === 37 ||
						( this.value.length === 0 && e.keyCode === 8 )
					)
				){
					e.preventDefault();

					// Focus Previous Parameter
					self.emit("prevInput");
				}

				// Right: If the Caret is at the end of the input
				if(
					this.value.length === this.selectionStart &&
					this.value.length === this.selectionEnd &&
					e.keyCode === 39 // Right - Go to Next Input
				){
					e.preventDefault();

					// Focus Next Parameter
					self.emit("nextInput");
				}
			})
			.on("input", inputResize);
	};

	Input.prototype.validate = function(){

		var value = this.$._.value;

		var check;
		
		if( this.type === "number" && !(check = value.match(/^\d+$/)) ){
			return "Not a number";
		}

		if( this.type === "time" && !(check = value.match(/^\d{1,2}:\d{2} (?:AM|PM)$/)) ){
			return "Not a valid time format";
		}


		return true;
	};

















	return Input;
})();
},{"./inputResize":6,"Element":7,"EventEmitter":8}],2:[function(require,module,exports){
module.exports = (function(){

	'use strict';

	var E = require("Element");
	var EventEmitter = require("EventEmitter");
	var Input = require("./Input");


	// Create Parameter Class
	function Parameter(param, autocomplete, schema){

		// Inherit the event emitter
		EventEmitter.apply(this);

		this.autocomplete = autocomplete;
		this.schema = schema;

		// Input DOMs
		param = param || {};
		this.name = new Input("name", param.name);
		this.operator = new Input("operator", param.operator);
		this.value = new Input("value", param.value);
		
		// Create DOM
		this.$ = 	E("div", { "class": "parameter" })
					.append(

						// Delete button
						E("span", { "class": "remove", "html": "&times;" })
						.on("click", this.emit.bind(this, "remove")),

						// Inputs
						this.name.$,
						this.operator.$,
						this.value.$
					);

		this.validateInputs();

		this.bindEvents();
	}

	Parameter.prototype = Object.create(EventEmitter.prototype);

	Parameter.prototype.lean = function lean(){
		return {
			name: this.name.lean(),
			operator: this.operator.lean(),
			value: this.value.lean(),
			invalid: this.invalid
		};
	};

	Parameter.prototype.bindEvents = function(){

		var self = this;

		this.on("rendered", function(){
			self.name.emit("rendered");
			self.operator.emit("rendered");
			self.value.emit("rendered");
		});

		// General events
		[this.name, this.operator, this.value].forEach(function(input){
			input
				.on("focus", function(){
					self.emit("focus");

					self.$.removeClass("error").addClass("selected");
				})
				.on("blur", function(){
					self.emit("blur");

					// Remove Selected Class from Parameter
					self.$.removeClass("selected");

					// Validate
					self.validateInputs();
				})
				.on("change", function(){ 
					self.emit("change");
				});
		});

		this.bindName();

		this.bindOperator();

		this.bindValue();
	};

	Parameter.prototype.bindName = function(){

		var self = this;

		this.name
		.on("nextInput", function(){ self.operator.focus(0); })
		.on("prevInput", function(){ self.emit("prevParameter"); })

		// Add autocomplete
		.on("focus", function(){

			// Add autocomplete
			self.autocomplete
				.bindTo(self.name.$, self.schema.names)
				.on("hover", previewInput(self.name))
				.on("selected", selected(self.name));
		});
	};

	Parameter.prototype.bindOperator = function(){

		var self = this;

		this.operator
		.on("nextInput", function(){ self.value.focus(0); })
		.on("prevInput", function(){ self.name.focus(-0); })
		.on("focus", function(){
			var schema = self.schema._[self.name.$._.value];

			// Add autocomplete
			self.autocomplete
				.bindTo(self.operator.$, (schema instanceof Object && schema.operators instanceof Object) && schema.operators)
				.on("hover", previewInput(self.operator))
				.on("selected", selected(self.operator));
		});
	};

	Parameter.prototype.bindValue = function(){

		var self = this;

		this.value
		.on("nextInput", function(){ self.emit("nextParameter"); })
		.on("prevInput", function(){ self.operator.focus(-0); })
		.on("focus", function(){

			var schema = self.schema._[self.name.$._.value];

			// Add autocomplete
			self.autocomplete
				.bindTo(self.value.$, (schema instanceof Object && schema.values instanceof Object) && schema.values)
				.on("hover", previewInput(self.value))
				.on("selected", selected(self.value));

			if( !(schema instanceof Object) ){ return; }

			// Type
			if( typeof schema.type === "string" ){
				self.value.type = schema.type;
			}

			// Placeholder
			if(
				(schema.valueAttrs instanceof Object) &&
				typeof schema.valueAttrs.placeholder === "string"
			){
				self.value
					.previewValue(schema.valueAttrs.placeholder);	
			}
		});
	};

	function previewInput(target){
		return function(value){
			target.previewValue(value);
		};
	}

	function selected(target){
		return function(value){
			target.changeValue(value);
		};
	}
	
	// Validation
	Parameter.prototype.validateInputs = function(){

		// Values
		var name = this.name.$._.value,
			operator = this.operator.$._.value,
			value = this.value.$._.value;

		// If All Empty, Delete
		if( !(name + operator + value).length ){
			this.emit("remove");
			return;
		}

		// If Any of them is Empty
		if( !name.length || !operator.length || !value.length ){
			this.$.addClass("error").attr("title", (this.invalid = "Incomplete parameter"));
			return;
		}

		// Invalid name && Strict => Error
		if( this.schema.strict ){
			
			if( !this.schema._.hasOwnProperty(name) ){
				this.$.addClass("error").attr("title", (this.invalid = "Invalid name"));
				return;
			}
			
			if( this.schema._[name].operators.indexOf(operator) === -1 ){
				this.$.addClass("error").attr("title", (this.invalid = "Invalid operator"));
				return;
			}

			if(
				this.schema._[name].values instanceof Array &&
				this.schema._[name].values.indexOf(value) === -1
			){
				this.$.addClass("error").attr("title", (this.invalid = "Invalid value"));
				return;
			}
		}

	
		// Input Type Constraint
		var inpVal;
		if( typeof (inpVal = this.value.validate()) === "string" ){
			this.$.addClass("error").attr("title", inpVal);
			return;
		}


		// Valid
		return (this.invalid = false);
	};

	return Parameter;
})();
},{"./Input":1,"Element":7,"EventEmitter":8}],3:[function(require,module,exports){
module.exports = (function(){

	'use strict';

	var E = require("Element");
	var EventEmitter = require("EventEmitter");

	// Individual Parameter
	var Parameter = require("./Parameter");

	var Autocomplete = require("./autoComplete");



	function Parameters($container, options){

		var self = this;

		EventEmitter.apply(self);
		Array.apply(self);

		self.schema = {
			strict: !!options.strict,
			names: Object.keys(options.schema),
			_: options.schema
		};

		/* DOMs */

		// Placeholder
		self.$placeholder =	E("div", { "class": "placeholder" })
							.css("pointerEvents", "none")
							.text(options.placeholder || "");

		// Main input field
		self.$inputField =	E("div", { "class": "parameters" })
							.append( self.$placeholder )
							.on("mousedown", function( e ){

								// Ignore Event Bubbling
								if( e.target !== self.$inputField._ ){ return; }

								// Prevent so the Input Focuses
								e.preventDefault();

								// Determine insert location
								var after = 0;
								self.some(function(param, idx){

									var position = param.$._.getBoundingClientRect();

									var top = document.body.scrollTop + position.top;
									if(
										// Stop Iterating if Row is below
										e.pageY < position.top ||

										// If on row but passed it
										(
											top < e.pageY && e.pageY < (top + position.height) &&
											position.left > e.pageX
										)
									){ return true; }

									after = idx + 1;
								});

								// Create Parameter
								self.insertAt(after, self.newParameter(), true);
							});

		self.autocomplete = new Autocomplete(self.$inputField);


		// Process default
		options.defaultQuery.forEach(function(param){
			if( !(param instanceof Object) ){ return; }

			self.insert(param);
		});

		// Render
		self.appendTo($container);

		// Event emitter starts listening after this function return, thus must be emitted after bind
		setTimeout(function(){
			self.emit("result", self.serialize());
		}, 0);
	}

	Parameters.prototype = Object.create(EventEmitter.prototype);

	// Inherit methods from Array
	["length", "splice", "indexOf", "forEach", "map", "some"].forEach(function(prop){
		Parameters.prototype[prop] = Array.prototype[prop];
	});

	Parameters.prototype.serialize = function serialize(){
		return this.map(function(p){ return p.lean(); });
	};

	Parameters.prototype.newParameter = function newParameter(param){

		var self = this,
			parameter = new Parameter(param, self.autocomplete, self.schema);

		return parameter
		.on("focus", function(){
			// Toggle Class - Focus
			self.$inputField.addClass("selected");

			self.emit("focus");
		})
		.on("blur", function(){
			// Toggle Class - Blur
			self.$inputField.removeClass("selected");

			self.emit("blur");
		})
		.on("remove", function(){
			self.remove(parameter);
			self.emit("result", self.serialize());
		})
		.on("change", function(){
			self.emit("result", self.serialize());
		})
		.on("prevParameter", function(prev){
			if( (prev = self.getPrev(parameter)) ){
				prev.value.focus();
			}else{
				self.insertAt(0, self.newParameter(), true);
			}
		})
		.on("nextParameter", function(next){
			if( (next = self.getNext(parameter)) ){
				next.name.focus(0);
			}else{
				self.insert();
			}
		});
	};

	Parameters.prototype.insertAt = function insertAt(idx, parameter, focus){

		// Hide placeholder
		this.$placeholder.hide();

		// Insert in DOM
		if( this[idx] ){
			this.$inputField._.insertBefore(parameter.$._, this[idx].$._);
		}
		else{ this.$inputField.append(parameter.$); }

		// Insert in Array
		this.splice(idx, 0, parameter);

		// Focus
		if( focus ){ parameter.name.focus(); }
	};

	Parameters.prototype.insert = function(param){
		this.insertAt(this.length, this.newParameter(param), !param);
	};

	Parameters.prototype.removeAt = function removeAt(idx){

		// Remove from array
		var removed = this.splice(idx, 1);

		// Removed, remove DOM
		if( removed.length === 1 ){ removed[0].$.remove(); }

		// Toggle Placeholder
		if( this.length === 0 ){ this.$placeholder.show(); }
	};

	Parameters.prototype.remove = function remove(parameter, find){

		// Ignore if not found
		if( (find = this.indexOf(parameter)) === -1 ){ return false; }

		// Remove
		this.removeAt( find );
	};

	Parameters.prototype.getPrev = function getPrev(current, i){
		if( (i = this.indexOf(current)) !== -1 ){
			return this[ i - 1 ];
		}
	};

	Parameters.prototype.getNext = function getNext(current, i){
		if( (i = this.indexOf(current)) !== -1 ){
			return this[ i + 1 ];
		}
	};

	Parameters.prototype.appendTo = function appendTo(target){

		// Render
		E(target).append(this.$inputField);

		this.forEach(function(param){
			param.emit("rendered");
		});
	};

	return Parameters;
})();
},{"./Parameter":2,"./autoComplete":5,"Element":7,"EventEmitter":8}],4:[function(require,module,exports){
/* VisualQuery.js v0.2 | github.com/hirokiosame/VisualQuery */
module.exports = function VisualQuery(selector, _options){

	'use strict';

	var $selected;

	/* Argument Validation */

	// Check if query
	if( typeof selector === "string" ){
		$selected = document.querySelector(selector);
	}

	// Check if DOM
	else if(
		(typeof HTMLElement === "function" && selector instanceof HTMLElement) ||
		(selector instanceof Object && selector.nodeType === 1 && typeof selector.nodeName === "string")
	){
		$selected = selector;
	}

	// If nothing has been selected
	if( !$selected ){ throw new Error("No element is selected"); }


	/* Set onfiguration  */

	// Default Options
	var options = Object.create({
		appendAutoCompleteTo: null,
		strict: false,
		schema: {},
		defaultQuery: [],
		placeholder: ""
	});

	// Overwite default
	for( var prop in _options ){
		options[prop] = _options[prop];
	}

	// Collection of Parameters - Singleton
	var Parameters = require("./Parameters");

	// Initialize
	return (new Parameters($selected, options));
};
},{"./Parameters":3}],5:[function(require,module,exports){
module.exports = (function(){
	
	'use strict';


	var E = require("Element");

	function Autocomplete( $parent ){

		this.$ul =	E("ul", { "class": "autoComplete" })
					.css("position", "absolute")
					.hide();

		this.lis = [];
		this.selectedLi = null;


		(this.$parent = $parent)
			.append( this.$ul )
			.on("scroll", this.adjustLocation.bind(this));



		var self = this;

		// Event based functions, must bind to self via closure
		this.onKeydown = function onKeydown(e){

			// Up
			if( e.keyCode === 38 ){

				var prev;
				if(
					// Currently selected is still displayed
					(self.selectedLi && self.selectedLi.shown()) &&
					(prev = self.selectedLi.prev()) && prev.shown()
				){
					e.preventDefault();
					self.selectLi(prev);
				}
			}

			// Down
			if( e.keyCode === 40 ){

				// If already selected, go to next
				if( self.selectedLi && self.selectedLi.shown() ){

					var next;
					if( (next = self.selectedLi.next()) && next.shown() ){
						e.preventDefault();
						self.selectLi(next);
					}

				// Select first visible li if not selected yet
				}else{

					var i;
					for( i = 0; i < self.lis.length; i++ ){

						if( self.lis[i].shown() ){
							e.preventDefault();
							self.selectLi(self.lis[i]);
							break;
						}
					}
				}
			}

			// Enter
			if( e.keyCode === 13 ){

				if( self.selectedLi && self.selectedLi.shown() ){
					self.EE.emit(
						"selected",
						self.selectedLi.text(),
						self.selectedLi.attr("value")
					);
				}else{
					self.EE.emit("selected");
				}
			}

		};

		this.onInput = function onInput(){

			// If Typed Doesn't match, Don't show
			var hidden = 0;
			for( var i = 0; i < self.lis.length; i++ ){
				if( self.lis[i].text().match(new RegExp(this.value, "i")) ){
					self.lis[i].show();
				}else{
					self.lis[i].hide();
					hidden++;
				}
			}

			// Show or hide the list
			if( hidden === self.lis.length ){ self.$ul.hide(); }
			else{ self.$ul.show(); }
		};


		this.hide = function hide(){
			self.$ul.hide();
		};

	}

	Autocomplete.prototype.adjustLocation = function adjustLocation(){

		var rectContain = this.$parent._.getBoundingClientRect(),
			rectIn = this.$input._.getBoundingClientRect();

		// If outside the visible area of scroll
		if( !(rectContain.left < rectIn.left && rectIn.left < rectContain.left + rectContain.width) ){
			this.$ul.hide(); return;
		}


		this.$ul.show().offset(0, 0);

		var	rectUl = this.$ul._.getBoundingClientRect();

		this.$ul
		.offset(
			(rectIn.top - rectUl.top + rectIn.height) + "px",
			(rectIn.left - rectUl.left) + "px"
		);
	};


	Autocomplete.prototype.selectLi = function selectLi(li){

		// Unselect currently selected
		if( this.selectedLi ){ this.selectedLi.removeClass("selected"); }

		this.selectedLi = E(li).addClass("selected");

		this.EE.emit("hover", this.selectedLi.text());

		this.adjustLocation();
	};

	Autocomplete.prototype.createLi = function createLi(text, value){
		var self = this;

		var li = 	E("li", { text: text })
					.on("mouseover", function(){ self.selectLi(this); })
					.on("mousedown", function(e){ e.preventDefault(); })
					.on("mouseup", function(){
						if( self.selectedLi && self.selectedLi.shown() ){
							self.EE.emit(
								"selected",
								self.selectedLi.text(),
								self.selectedLi.attr("value")
							);
						}
					});


		if( value ){ li.attr("value", value); }

		return li;
	};

	Autocomplete.prototype.setList = function setList(list){

		// Empty array
		this.lis.splice(0);


		if( list instanceof Array ){

			// Add every li
			for( var key in list ){
				this.lis.push( this.createLi(list[key], !(list instanceof Array) && key ) );
			}
		}

		// Reset Lis
		this.$ul.html("").append(this.lis);
	};



	Autocomplete.prototype.bindTo = function bindTo($input, list){

		// Unbind from previous input
		if( this.$input ){

			// Unbind!
			this.$input
				.off("keydown", this.onKeydown)
				.off("input", this.onInput)
				.off("blur", this.hide);

			this.$input = null;
			this.EE = null;
		}

		var EventEmitter = require("EventEmitter");

		this.EE = new EventEmitter();

		// If there are suggestions to make...
		// if( list instanceof Array && list.length > 0 ){

			this.$input =	$input
							.on("keydown", this.onKeydown)
							.on("input", this.onInput)
							.on("blur", this.hide);

			this.setList(list);
			this.adjustLocation();
			this.onInput.apply($input._);
		// }

		return this.EE;
	};





	return Autocomplete;
})();
},{"Element":7,"EventEmitter":8}],6:[function(require,module,exports){
module.exports = function inputResize(){

	'use strict';

	var	value = this.value,
		useText = value || ( this.attributes.placeholder && this.attributes.placeholder.value ) || "";
	
	var shadow = document.createElement("span");
	
	shadow.textContent = useText;
	shadow.style.position = 'absolute';
	shadow.style.width = 'auto';
	shadow.style.visibility = 'hidden';
	shadow.style.whiteSpace = 'pre';
	
	var computedStyle = getComputedStyle(this);
	[
		'fontSize',
		'fontFamily',
		'fontWeight',
		'fontStyle',
		'fontVariant',
		'wordSpacing',
		'letterSpacing',
		'textIndent',
		'textRendering',
		'textTransform'
	].forEach(function(ruleName){
		shadow.style[ruleName] = computedStyle[ruleName];
	});
	
	// Insert below
	this.parentNode.appendChild(shadow);
	
	// Set Width
	this.style.width = (
		
		// Width of Shadow + Fallback Width for Empty Inputs
		(shadow.offsetWidth || 5 ) +
		
		// Width of Caret
		1
	)+"px";
	
	this.parentNode.removeChild(shadow);
	
};
},{}],7:[function(require,module,exports){
module.exports = (function(){
	'use strict';

	function E(lement){
		this._ = lement;
	}

	E.prototype.addClass = function addClass(className){
		var split = className.split(" ");

		for( var i = 0; i < split.length; i++ ){
			if( !split[i] ){ continue; }
			if( this._.classList ){ this._.classList.add(split[i]); }
			else{ this._.className = split[i]; }
		}
		return this;
	};

	E.prototype.removeClass = function removeClass(className){
		if( this._.classList ){ this._.classList.remove(className); }
		else{
			this._.className = this._.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
		}
		return this;
	};

	E.prototype.hide = function hide(){
		if( this._.style.display !== "none" ){
			this._.style.display = "none";
		}
		return this;
	};

	E.prototype.show = function show(){
		if( this._.style.display !== "block" ){
			this._.style.display = "block";
		}
		return this;
	};

	E.prototype.shown = function shown(){
		return	( this._ === document ) ||
				( this._.style.display !== "none" && this._.parentNode !== null );
	};

	E.prototype.on = function on(eventNames, eventCallback, useCapture){

		if( !(this._events instanceof Object) ){ this._events = {}; }

		useCapture = !!useCapture;
		eventNames = eventNames.split(" ");

		var i = eventNames.length;
		while( i-- ){
			var eName = eventNames[i];

			// Keep track of event listeners for future removal
			if( !(this._events[eName] instanceof Array) ){ this._events[eName] = []; }
			this._events[eName].push(eventCallback);

			this._.addEventListener(eName, eventCallback, useCapture);
		}

		return this;
	};

	E.prototype.off = function off(eventNames, eventCallback){

		if( !(this._events instanceof Object) ){ this._events = {}; }

		eventNames = eventNames.split(" ");

		var i = eventNames.length;

		// Remove particular event listener
		if( eventCallback instanceof Function ){

			while( i-- ){
				var eName = eventNames[i];

				if( !(this._events[eName] instanceof Array) ){ continue; }

				var idx = this._events[eName].indexOf(eventCallback);

				if( idx !== -1 ){ this._events[eName].splice(idx, 1); }

				this._.removeEventListener(eName, eventCallback);
			}
		}

		// Remove all event listeners
		else{
			while( i-- ){
				var eName = eventNames[i];
				if( !(this._events[eName] instanceof Array) ){ continue; }

				var cb;
				while( cb = this._events[eName].pop() ){
					this._.removeEventListener(eName, cb);
				}
			}
		}

		return this;
	};

	E.prototype.one = function one(eventName, eventCallback){
		var self = this;
		return this.on(eventName, function cb(){
			self.off(eventName, cb);
			eventCallback.apply(this, [].slice.apply(arguments));
		});
	};

	E.prototype.append = function append(arr){

		var args = arr instanceof Array ? arr : arguments;

		// To avoid reflows
		var container = document.createDocumentFragment();

		for( var i = 0, len = args.length; i < len; i++ ){
			container.appendChild( args[i] instanceof E ? args[i]._ : args[i] );
		}

		this._.appendChild(container);

		return this;
	};

	E.prototype.replaceWith = function replaceWith(el){

		el = el instanceof E ? el._ : el;

		if( this._.parentNode ){
			this._.parentNode.replaceChild(el, this._);
		}

		this._ = el;

		return this;
	};

	E.prototype.text = function text(textContent, append){

		var el = this.textWrap || this._;

		if( arguments.length === 0 ){ return el.textContent; }

		// Change text  
		// textContent is faster than innerText
		// but textContent isn't aware of style
		// line breaks dont work

		// Back to textContent - firefox doesn't support innertext...
		el.textContent = (append ? el.textContent : "") + textContent;

		return this;
	};

	E.prototype.html = function html(htmlContent, append){

		// Change html
		this._.innerHTML = (append ? this._.innerHTML : "") + htmlContent;

		return this;
	};


	E.prototype.attr = function attr(name, value){

		if( typeof name !== "string" ){ throw new Error("An attribute name is required"); }

		if( value === undefined ){ return this._.getAttribute(name); }

		this._.setAttribute(name, value);

		return this;
	};

	E.prototype.remove = function remove(){
		if( !this._.parentNode ){ return; }
		this._.parentNode.removeChild(this._);

		return this;
	};


	E.prototype.offset = function offset(top, left){

		this._.style.top = top;
		this._.style.left = left;

		return this;
	};

	E.prototype.css = function css(name, value){

		if( typeof name === "string"){
			if( typeof value === "string" ){
				this._.style[name] = value;
			}else{
				return getComputedStyle(this._)[name];
			}
		}
		else if( name instanceof Object ){
			for( var prop in name ){
				this._.style[prop] = name[prop];
			}
		}

		return this;
	};

	E.prototype.trigger = function trigger(eventName){

		var evnt = new Event(eventName);

		this._.dispatchEvent(evnt);

		return this;
	};

	E.prototype.focus = function focus(caretStart, caretEnd){
		
	 	// Focus element
		this._.focus();

		if( typeof caretStart === "number" ){

			// If start is -0, set at the very end
			// (+0 === -0 but Infinity =/= -Infinity)
			if( (1/caretStart) === -Infinity ){ caretStart = this._.value.length; }

			if( typeof caretEnd !== "number" ){ caretEnd = caretStart; }

			try{
				this._.setSelectionRange( caretStart, caretEnd );
			}
			catch(err){}
		}

		return this;
	};

	E.prototype.prev = function prev(){
		if( this._.previousSibling ){
			return new E(this._.previousSibling);	
		}
	};

	E.prototype.next = function next(){
		if( this._.nextSibling ){
			return new E(this._.nextSibling);	
		}
	};

	E.prototype.data = function data(key, value){

		if( !(this._data instanceof Object) ){ this._data = {}; }

		if( value === undefined ){
			return this._data[key];
		}

		this._data[key] = value;

		return this;
	};

	return function (el, opts){

		// Ignore if already an instance
		if( el instanceof E ){ return el; }

		var instance = new E();

		// el is a string
		if( typeof el === "string" ){

			// Create element
			instance._ = document.createElement(el);

			if( typeof opts === "object" ){

				var _opts = Object.create(opts);


				// Text container element
				if( typeof _opts.textWrap === "string" ){

					instance.textWrap = document.createElement(_opts.textWrap);
					instance._.appendChild( instance.textWrap );
					_opts.textWrap = null;
				}

				// Inner text
				if( _opts.text !== undefined && opts.text !== null ){
					instance.text(_opts.text);
					_opts.text = null;
				}

				// Inner HTML
				if( typeof _opts.html === "string" ){
					instance.html(_opts.html);
					_opts.html = null;
				}

				// Add Class
				if( typeof _opts.class === "string" ){
					instance.addClass(_opts.class);
					_opts.class = null;
				}

				// Set everything else as an attribute
				for( var at in _opts ){
					if( _opts[at] ){
						instance._.setAttribute(at, _opts[at]);
					}
				}
			}
		}else{
			instance._ = el;
		}

		return instance;
	};
})();
},{}],8:[function(require,module,exports){
module.exports = (function(){

	'use strict';

	function EventEmitter(async){
		this._events = {};
		this.async = !!async;
	}

	EventEmitter.prototype.on = function on(eName, fn){

		// Must be an object
		if( !(this._events instanceof Object) ){ this._events = {}; }

		var arr;

		// Must be an array
		if( !((arr = this._events[eName]) instanceof Array) ){
			(arr = this._events[eName] = []);
		}

		// Add function
		arr.push(fn);

		return this;
	};

	EventEmitter.prototype.off = function off(eName, fn){

		// If events not initialized or
		// If no event name, remove all events
		if(
			!(this._events instanceof Object) ||
			eName === undefined
		){ this._events = {}; }


		var arr, idx;

		// If no events to remove
		if( !((arr = this._events[eName]) instanceof Array) ){
			return false;
		}

		// Remove all
		if( fn === undefined ){
			arr.splice(0);
		}

		// Remove function
		else if( (idx = arr.indexOf(fn)) !== -1 ){
			arr.splice(idx, 1);
		}


		return this;
	};

	EventEmitter.prototype.emit = function emit(eName){

		// Must be an object
		if( !(this._events instanceof Object) ){ this._events = {}; }

		// Must be an array
		if( !(this._events[eName] instanceof Array) ){ return false; }

		// Slice out the arguments for emit
		var args = [].slice.apply(arguments, [1]);

		// Trigger each
		var evnts = this._events[eName],
			cb;

		for( var i = 0, len = evnts.length; i < len; i++ ){

			// Validate function
			if( !((cb = evnts[i]) instanceof Function) ){ continue; }

			// Trigger asynchronously
			if( this.async === true ){
				setTimeout((function(self, cb, args){
					return function(){ cb.apply(self, args); };
				})(this, cb, args), 0);
			}else{
				cb.apply(this, args);
			}
		}
	};

	return EventEmitter;

})();
},{}]},{},[4])(4)
});