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