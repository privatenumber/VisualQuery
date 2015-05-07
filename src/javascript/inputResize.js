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