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