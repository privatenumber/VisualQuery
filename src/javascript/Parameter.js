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

					// Remove Selected Class from Parameter
					self.$.removeClass("selected");

					// Validate
					self.validateInputs();
					
					self.emit("blur");
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