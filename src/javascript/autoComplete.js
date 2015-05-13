module.exports = (function(){

	'use strict';

	var EventEmitter = require("EventEmitter");

	var E = require("Element");

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

	return function(el, options){

		// Enforce input-text
		if( el._.tagName !== "INPUT" || el.attr("type") !== "text" ){
			return new Error("Autocomplete must be bound to an input-text element");
		}

		// Unbind
		if( !(options instanceof Object) ){ return ul.hide(); }

		// Verify that appendTo exists
		if( !options.appendTo ){
			return new Error("The appendTo property is required to render the auto complete");
		}

		var appendTo = options.appendTo;

		function adjustLocation(){

			var rectP = appendTo._.getBoundingClientRect(),
				rectC = el._.getBoundingClientRect();

			ul.show()
			.offset(
				(rectC.top - rectP.top - appendTo._.scrollTop) + rectC.height + document.body.scrollTop + "px",
				(rectC.left - rectP.left - appendTo._.scrollLeft) + document.body.scrollLeft + "px"
			);
		}

		appendTo
			.append(ul)
			.on("scroll", adjustLocation);

		adjustLocation();

		return	LIs
				.setDatalist(options.datalist)
				.listenTo(el);
	};
})();