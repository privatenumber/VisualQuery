module.exports = (function(){

	'use strict';

	var EventEmitter = require("EventEmitter");
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