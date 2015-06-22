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