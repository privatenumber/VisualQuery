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