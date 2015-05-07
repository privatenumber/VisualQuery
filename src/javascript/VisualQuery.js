/* VisualQuery.js v0.2 | github.com/hirokiosame/VisualQuery */
window.VisualQuery = function(selector, _options){

	'use strict';

	var selected = document.querySelector(selector);
	

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