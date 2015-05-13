module.exports = (function(){

	'use strict';


	var E = require("Element");
	var EventEmitter = require("EventEmitter");


	var ul = E("ul", { "class": "autoComplete" })
				.css("position", "absolute")
				.hide();


	var LIs = (function(){

		var input = null, EE = null;

		var lis = [], selected = null;

		function select(li){

			// Unselect currently selected
			if( selected ){ selected.removeClass("selected"); }

			selected = E(li).addClass("selected");

			EE.emit("hover", selected.text());
		}

		function onInput(){

			// If Typed Doesn't match, Don't show
			var hidden = 0;
			for( var i = 0; i < lis.length; i++ ){
				if( lis[i]._.innerText.match(new RegExp(this.value, "i")) ){
					lis[i].show();
				}else{
					lis[i].hide();
					hidden++;
				}
			}

			// Show or hide the list
			if( hidden === lis.length ){ ul.hide(); }
			else{ ul.show(); }
		}

		function onKeydown(e){

			// Up
			if( e.keyCode === 38 ){

				var prev;
				if(
					// Currently selected is still displayed
					(selected && selected.shown()) &&
					(prev = selected.prev()) && prev.shown()
				){
					e.preventDefault();
					select(prev);
				}
			}

			// Down
			if( e.keyCode === 40 ){

				// If already selected, go to next
				if( selected && selected.shown() ){

					var next;
					if( (next = selected.next()) && next.shown() ){
						e.preventDefault();
						select(next);
					}

				// Select first visible li if not selected yet
				}else{

					var i;
					for( i = 0; i < lis.length; i++ ){
						if( lis[i].shown() ){
							e.preventDefault();
							select(lis[i]);
							break;
						}
					}
				}
			}

			// Enter
			if( e.keyCode === 13 ){
				if( selected && selected.shown() ){
					EE.emit(
						"selected",
						selected.text(),
						selected.attr("value")
					);
				}else{
					EE.emit("selected");
				}
			}
		}
	
		function createLi(text, value){
			var li = 	E("li", { text: text })
						.on("mouseover", function(){ select(this); })
						.on("mousedown", function(e){ e.preventDefault(); })
						.on("mouseup", function(){
							if( selected && selected.shown() ){
								EE.emit(
									"selected",
									selected.text(),
									selected.attr("value")
								);	
							}
						});


			if( value ){ li.attr("value", value); }

			return li;
		}

		return {
			setDatalist: function (datalist){

				// Empty array
				lis.splice(0);

				// Add every li
				for(var key in datalist){
					lis.push( createLi(datalist[key], !(datalist instanceof Array) && key ) );
				}

				// Reset Lis
				ul.html("").append(lis);

				return this;
			},
			listenTo: function(_input){

				// Unlisten from previous input
				if( input ){

					selected = null;

					input
						.off("keydown", onKeydown)
						.off("input", onInput);
				}

				input = _input;

				EE = new EventEmitter();

				input
					.on("keydown", onKeydown)
					.on("input", onInput);

				// Trigger for current input value
				onInput.apply(input._);

				return EE;
			}
		};
	})();

	var appendedTo,
		inputEl;

	function adjustLocation(){

		var rectContain = appendedTo._.getBoundingClientRect(),
			rectIn = inputEl._.getBoundingClientRect();

		if( !(rectContain.left < rectIn.left && rectIn.left < rectContain.left + rectContain.width) ){
			ul.hide(); return;
		}


		ul.show().offset(0, 0);

		var	rectUl = ul._.getBoundingClientRect();

		ul
		.offset(
			(rectIn.top - rectUl.top + rectIn.height) + "px",
			(rectIn.left - rectUl.left) + "px"
		);
	}

	return function(el, options){

		// Enforce input-text
		if( el._.tagName !== "INPUT" || el.attr("type") !== "text" ){
			throw new Error("Autocomplete must be bound to an input-text element");
		}

		// Unbind
		if( !(options instanceof Object) ){
			ul.hide();
			inputEl.off("scroll", adjustLocation);
			appendedTo.off("scroll", adjustLocation);
			return;
		}

		// Verify that appendTo exists
		if( !options.appendTo ){
			throw new Error("The appendTo property is required to render the auto complete");
		}


		inputEl = el.on("input", adjustLocation);
		(appendedTo = options.appendTo)
			.append(ul)
			.on("scroll", adjustLocation);

		adjustLocation();

		return	LIs
				.setDatalist(options.datalist)
				.listenTo(el);
	};
})();