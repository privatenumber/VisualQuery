(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
		return this._.style.display !== "none";
	};

	E.prototype.on = function on(eventNames, eventCallback, useCapture){

		useCapture = !!useCapture;
		eventNames = eventNames.split(" ");

		for( var i = 0, len = eventNames.length; i < len; i++ ){
			this._.addEventListener(eventNames[i], eventCallback, useCapture);
		}

		return this;
	};

	E.prototype.off = function off(eventNames, eventCallback){

		eventNames = eventNames.split(" ");

		for( var i = 0, len = eventNames.length; i < len; i++ ){
			this._.removeEventListener(eventNames[i], eventCallback);
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

		for( var i = 0, len = args.length; i < len; i++ ){
			this._.appendChild( args[i] instanceof E ? args[i]._ : args[i] );
		}

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

		if( typeof value !== "string" ){ return this._.getAttribute(name); }

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
},{}],2:[function(require,module,exports){
module.exports = (function(){

	'use strict';

	function EventEmitter(){
		this._events = {};
	}

	EventEmitter.prototype.emit = function(eName){

		// Return if not exist
		if( !this._events[eName] ){ return false; }

		var args = [].slice.apply(arguments, [1]);

		// Trigger each
		this._events[eName].forEach(function(cb){ cb.apply(window, args); });
	};

	EventEmitter.prototype.on = function(eName, callback){

		// Add callback
		( this._events[eName] || (this._events[eName] = []) ).push(callback);

		return this;	
	};

	return EventEmitter;

})();
},{}],3:[function(require,module,exports){
module.exports = (function(){

	'use strict';

	var EventEmitter = require("./EventEmitter");
	var E = require("Element");


	var inputResize = require("./inputResize");


	function Input(name, value){

		// Inherit event emitter
		EventEmitter.apply(this);

		this.name = name;
		
		// Create DOM
		this.$ = E("input", {
					type: "text",
					spellcheck: "false",
					autoComplete: "off",
					"class": name
				})
				.css("width", "1px");

		if( value ){
			this.$._.value = value;	
		}

		this.bindEvents();
	}

	Input.prototype = Object.create(EventEmitter.prototype);

	Input.prototype.toJSON = function(){
		return this.$._.value;
	};

	Input.prototype.previewValue = function(value){
		this.$
			.attr("placeholder", value)
			.trigger("input");
	};

	Input.prototype.focus = function(start){

		if(
			this.$._.type !== "number" &&
			typeof start === "number" &&
			this.$._.setSelectionRange
		){

			// Beacause of Chrome removing Select API on new input types (eg. number)
			this.$._.setSelectionRange(start, start);
		}

		this.$._.focus();
	};

	Input.prototype.changeValue = function(value){

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

	Input.prototype.bindEvents = function(){
		var self = this;

		this.on("rendered", function(){
			self.$.trigger('input');
		});

		this.$
			.on("focus", function(){ self.emit("focus"); })
			.on("blur", function(){ self.emit("blur"); })
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

		var value = this.$.value;

		// Length check
		if( value.length === 0 ){ return false; }

		return true;
	};

	return Input;
})();
},{"./EventEmitter":2,"./inputResize":8,"Element":1}],4:[function(require,module,exports){
module.exports = (function(){

	'use strict';

	var autoComplete = require("./autoComplete");

	var Input = require("./Input");

	var EventEmitter = require("./EventEmitter");

	var E = require("Element");

	// Create Parameter Class
	function Parameter(collection, param){

		// Inherit the event emitter
		EventEmitter.apply(this);

		this.collection = collection;

		// Input DOMs
		param = param || {};
		this.name = new Input("name", param.name);
		this.operator = new Input("operator", param.operator);
		this.value = new Input("value", param.value);

		// Create Remove button
		var removeButton = E("span", { "class": "remove", "html": "&times;" })
							.on("click", this.emit.bind(this, "remove"));

		// Create DOM
		this.$ = 	E("div", { "class": "parameter" })
					.append(
						removeButton,
						this.name.$,
						this.operator.$,
						this.value.$
					);


		this.bindEvents();
	}

	Parameter.prototype = Object.create(EventEmitter.prototype);

	Parameter.prototype.toJSON = function(){
		return {
			name: this.name.toJSON(),
			operator: this.operator.toJSON(),
			value: this.value.toJSON()
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
			autoComplete(self.name.$, {
				appendTo: self.collection.$,
				datalist: self.collection.names
			})
			.on("hover", previewInput(self.name))
			.on("selected", selected(self.name));
		})

		// Remove autocomplete
		.on("blur", function(){
			autoComplete(self.name.$);

			// var type = self.collection.opts.schema[self.name.$._.value].type;
			// if( type ){
			// 	self.value.$._.type = type;
			// }
		});
	};

	Parameter.prototype.bindOperator = function(){

		var self = this;

		this.operator
		.on("nextInput", function(){ self.value.focus(0); })
		.on("prevInput", function(){ self.name.focus(); })
		.on("focus", function(){

			// Add autocomplete
			autoComplete(self.operator.$, {
				appendTo: self.collection.$,
				datalist: self.collection.opts.schema[self.name.$._.value].operators
			})
			.on("hover", previewInput(self.operator))
			.on("selected", selected(self.operator));
		})

		// Remove autocomplete
		.on("blur", function(){ autoComplete(self.operator.$); });
	};

	Parameter.prototype.bindValue = function(){

		var self = this;

		this.value
		.on("nextInput", function(){ self.emit("nextParameter"); })
		.on("prevInput", function(){ self.operator.focus(); })
		.on("focus", function(){

			if( self.value.$._.type !== "text" ){ return; }

			// Add autocomplete
			autoComplete(self.value.$, {
				appendTo: self.collection.$,
				datalist: self.collection.opts.schema[self.name.$._.value].values
			})
			.on("hover", previewInput(self.value))
			.on("selected", selected(self.value));
		})

		// Remove autocomplete
		.on("blur", function(){ autoComplete(self.value.$); });
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
			return false;
		}

		// If Any of them is Empty
		if( !name.length || !operator.length || !value.length ){
			this.$.addClass("error");
			return false;
		}
/*
		// Invalid name && Strict => Error
		if( options.strict && !parameters.hasOwnProperty(name) ){
			return this.$.addClass("error").attr("title", "Invalid Parameter") && false;
		}

		// Input Type Constraint
		if( !this.value[0].checkValidity() ){
			return this.$.addClass("error").attr("title", this.value[0].validationMessage) && false;
		}*/

		// Valid
		return true;
	};

	return Parameter;
})();
},{"./EventEmitter":2,"./Input":3,"./autoComplete":7,"Element":1}],5:[function(require,module,exports){
module.exports = (function(){

	'use strict';

	// Individual Parameter
	var Parameter = require("./Parameter");

	var E = require("Element");

	// Placeholder Text
	var placeholder = E("div", { "class": "placeholder" });
		placeholder._.style.pointerEvents = "none";


	// Main input field
	var mainInput = E("div", { "class": "parameters" })
					.append(placeholder)
					.on("mousedown", function(e){

						// Ignore Event Bubbling
						if( e.target !== API.$._ ){ return; }

						// Prevent so the Input Focuses
						e.preventDefault();

						// Determine insert location
						var after = 0;
						API.parameters.some(function(param, idx){

							var position = param.$._.getBoundingClientRect();

							var top = document.body.scrollTop+ position.top;
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
						API.insertAt(after, new Parameter(API), true);
					});


	var	API = {};

		// Array of parameters
		API.parameters = [];

		// Div Container For Parameters
		API.$ =	mainInput;

		// Initialize
		API.init = function(options){

			this.opts = options;
			console.log( this.opts );

			// Placeholder text
			placeholder.text(options.placeholder || "");

			// Prepare datalists for auto complete
			this.names = Object.keys(options.schema);
			// options.schema.forEach(function(param){

			// 	// Names key
			// 	if( !self.aCdb.names ){ self.aCdb.names = []; }
			// 	self.aCdb.names.push(param.name);
				
			// 	// Operatory key
			// 	var opKey = param.name + "_operators";
			// 	self.aCdb[opKey] = param.operators;

			// 	// Values key
			// 	var valKey = param.name + "_values";
			// 	self.aCdb[valKey] = param.values;
			// });

			// Process default
			this.opts.defaultQuery.forEach(function(param, i){
				API.insertAt(i, new Parameter(API, param));
			});

			API.callback();
		};

		function paramBindEvents(parameter){
			parameter
			.on("focus", function(){
				// Toggle Class - Focus
				API.$.addClass("selected");
			})
			.on("blur", function(){
				// Toggle Class - Blur
				API.$.removeClass("selected");
			})
			.on("remove", function(){
				API.remove(parameter);
			})
			.on("change", function(){
				API.callback();
			})
			.on("prevParameter", function(prev){
				( prev = API.getPrev(parameter) ) && prev.value.focus();
			})
			.on("nextParameter", function(next){
				if( (next = API.getNext(parameter)) ){
					next.name.focus(0);
				}else{
					API.insertAt(API.parameters.length, new Parameter(API), true);
				}
			});
		}

		API.insertAt = function(idx, parameter, focus){

			// Hide placeholder
			placeholder.hide();

			// Insert in DOM
			if( this.parameters[idx] ){
				mainInput._.insertBefore(parameter.$._, this.parameters[idx].$._);
			}
			else{ this.$.append(parameter.$); }

			// Insert in Array
			this.parameters.splice(idx, 0, parameter);

			paramBindEvents(parameter);

			// Focus
			if( focus ){ parameter.name.focus(); }
		};

		API.removeAt = function(idx){

			// Remove from array
			var removed = this.parameters.splice(idx, 1);

			// Removed, remove DOM
			if( removed.length === 1 ){ removed[0].$.remove(); }

			// Toggle Placeholder
			if( this.parameters.length === 0 ){ placeholder.show(); }

			API.callback();
		};

		API.remove = function(parameter, find){

			// Ignore if not found
			if( (find = this.parameters.indexOf(parameter)) === -1 ){ return false; }

			// Remove
			this.removeAt( find );
		};

		API.getPrev = function(current, i){
			if( (i = this.parameters.indexOf(current)) !== -1 ){
				return this.parameters[ i - 1 ];
			}
		};

		API.getNext = function(current, i){
			if( (i = this.parameters.indexOf(current)) !== -1 ){
				return this.parameters[ i + 1 ];
			}
		};

		API.renderTo = function(target){

			// Render
			E(target).append(this.$);

			this.parameters.forEach(function(param){
				param.emit("rendered");
			});
		};

		API.callback = function(){
			API.opts.callback(API.parameters.map(function(p){ return p.toJSON(); }));
		};

	return API;
})();
},{"./Parameter":4,"Element":1}],6:[function(require,module,exports){
/* VisualQuery.js v0.2 | github.com/hirokiosame/VisualQuery */
module.exports = function VisualQuery(selector, _options){

	'use strict';

	var selected;

	// Check if query
	if( typeof selector === "string" ){
		selected = document.querySelector(selector);
	}

	// Check if DOM
	else if(
		(typeof HTMLElement === "object" && selector instanceof HTMLElement) ||
		(selector instanceof Object && selector.nodeType === 1 && selector.nodeName === "string")
	){
		selected = selector;
	}

	// If nothing has been selected
	if( !selected ){ throw new Error("No element is selected"); }



	// Validate Options
	var options = Object.create({
		strict: false,
		schema: [],
		defaultQuery: [],
		placeholder: "",
		callback: function(){},
	});

	for( var prop in _options ){	
		options[prop] = _options[prop];
	}


	// Collection of Parameters - Singleton
	var Parameters = require("./Parameters");

	// Initialize
	Parameters.init(options);

	// Render
	Parameters.renderTo(selected);
};
},{"./Parameters":5}],7:[function(require,module,exports){
module.exports = (function(){

	'use strict';

	var EventEmitter = require("./EventEmitter");
	var E = require("Element");

	var ul = E("ul", { "class": "autoComplete" })
				.css("position", "absolute")
				.hide();


	var LIs = (function(){

		var input = null, EE = null;

		var lis = [], selected = null;

		function select(li){

			// Unselect currently selected
			if( selected ){ selected.removeClass("selected"); }

			selected = E(li).addClass("selected");

			EE.emit("hover", selected._.innerText);
		}

		function onInput(){

			// If Typed Doesn't match, Don't show
			var hidden = 0;
			for( var i = 0; i < lis.length; i++ ){
				if( lis[i]._.innerText.match(new RegExp(this.value, "i")) ){
					lis[i].show();
				}else{
					lis[i].hide();
					hidden++;
				}
			}

			// Show or hide the list
			if( hidden === lis.length ){ ul.hide(); }
			else{ ul.show(); }
		}

		function onKeydown(e){

			// Up
			if( e.keyCode === 38 ){

				var prev;
				if(
					// Currently selected is still displayed
					(selected && selected.shown()) &&
					(prev = selected.prev()) && prev.shown()
				){
					e.preventDefault();
					select(prev);
				}
			}

			// Down
			if( e.keyCode === 40 ){
				if( selected && selected.shown() ){

					var next;
					if( (next = selected.next()) && next.shown() ){
						e.preventDefault();
						select(next);
					}

				// Select first visible li if not selected yet
				}else{

					var i;
					for( i = 0; i < lis.length; i++ ){
						if( lis[i].shown() ){
							e.preventDefault();
							select(lis[i]);
							break;
						}
					}
				}
			}

			// Enter
			if( e.keyCode === 13 ){
				if( selected && selected.shown() ){
					EE.emit(
						"selected",
						selected.text(),
						selected.attr("value")
					);
				}else{
					EE.emit("selected");
				}
			}
		}
	
		function createLi(text, value){
			var li = 	E("li", { text: text })
						.on("mouseover", function(){ select(this); })
						.on("mousedown", function(e){ e.preventDefault(); })
						.on("mouseup", function(){
							if( selected && selected.shown() ){
								EE.emit(
									"selected",
									selected.text(),
									selected.attr("value")
								);	
							}
						});


			if( value ){ li.attr("value", value); }

			return li;
		}

		return {
			setDatalist: function (datalist){

				// Empty array
				lis.splice(0);

				// Add every li
				for(var key in datalist){
					lis.push( createLi(datalist[key], !(datalist instanceof Array) && key ) );
				}

				// Reset Lis
				ul.html("").append(lis);

				return this;
			},
			listenTo: function(_input){

				// Unlisten from previous input
				if( input ){

					selected = null;

					input
						.off("keydown", onKeydown)
						.off("input", onInput);
				}

				input = _input;

				EE = new EventEmitter();

				input
					.on("keydown", onKeydown)
					.on("input", onInput);

				// Trigger for current input value
				onInput.apply(input._);

				return EE;
			}
		};
	})();

	return function(el, options){

		// Enforce input-text
		if( el._.tagName !== "INPUT" || el.attr("type") !== "text" ){
			return new Error("Autocomplete must be bound to an input-text element");
		}

		// Unbind
		if( !(options instanceof Object) ){ return ul.hide(); }

		// Verify that appendTo exists
		if( !options.appendTo ){
			return new Error("The appendTo property is required to render the auto complete");
		}

		options.appendTo.append(ul);

		ul.show()
		.offset(
			el._.offsetTop + el._.offsetHeight + "px",
			el._.offsetLeft + "px"
		);


		return	LIs
				.setDatalist(options.datalist)
				.listenTo(el);
	};
})();
},{"./EventEmitter":2,"Element":1}],8:[function(require,module,exports){
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
},{}]},{},[6]);
