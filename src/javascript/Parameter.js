module.exports = (function(){

	'use strict';

	var E = require("Element");
	var EventEmitter = require("EventEmitter");

	var autoComplete = require("./autoComplete");

	var Input = require("./Input");



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

		// Create DOM
		this.$ = 	E("div", { "class": "parameter" })
					.append(
						E("span", { "class": "remove", "html": "&times;" })
						.on("click", this.emit.bind(this, "remove")),
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

		this.$.on("mousedown", function(e){
			e.preventDefault();

			if( !self.name.validate() ){
				return self.name.focus();
			}

			if( !self.operator.validate() ){
				return self.operator.focus();
			}

			self.value.focus();
			
		});
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
		.on("prevInput", function(){ self.name.focus(-0); })
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
		.on("prevInput", function(){ self.operator.focus(-0); })
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