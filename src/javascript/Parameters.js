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