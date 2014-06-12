// Create autoComplete Class
var autoComplete = (function(){
	var input, datalist, padding,

		// Render autoComplete List
		el = $("<ul>", { "class" : "autoComplete" })

				// Immutable Autocomplete CSS
				.css({
					'position': 'absolute',
					'display': 'none'
				})

				// Hover implemented in CSS because '.selected' is an identifier
				.on("mouseover", "li", function(){

					var select = $(this).addClass("selected");

					// Remove Class
					select.siblings(".selected").removeClass("selected");

					// Set Placeholder
					input.attr("placeholder", select.attr("value")).trigger("adjustWidth");
				})

				// Can't be click because input will be blurred & dropdown will disappear
				.on("mousedown", "li", function(e){
					e.preventDefault();

					input
						.removeAttr("placeholder")
						.val( $(this).attr("value") )
						.trigger("input")
						.blur()
						.next().focus();
				}),

		// Render the Lis so it matches the Input Value
		renderLis = function(){

			var index = el.children(".selected").index(),
				select = index !== -1 ? index : 0,
				list =	datalist.map(function(li, idx){
							// If Typed Doesn't match, Don't show
							if( !li.match(new RegExp(input.val(), "i")) ){ return; }

							return $("<li>", {
								"text": li,

								//Automatically Select First one
								"class": ( select === idx ? (input.attr("placeholder", li).trigger("adjustWidth") && "selected") : "" )
							}).attr("value", li);
						}).filter(function(elem){ return elem; });


			// Dynamic Padding adapting to CSS
			padding = padding || parseInt(el.find("li").css("padding-left"));

			return ( list.length ? el.html(list).show() : el.hide() );
		};


	return {

		// DOM Element
		$: el,

		// Set Target Input
		// Pass in Input Element so that it can enter values when li is clicked
		targetInput: function(target){
			// var self = this;
			return	( input = $(target).on({
						"input": renderLis.bind(this),
						"blur": function(){ $(this).unbind("keydown input"); },
						"keydown": function(e){

							var input = $(this), selected;

							// Enter
							if( e.keyCode === 13 ){
								e.preventDefault();

								// If Dropdown is selected, use selected
								e = el.is(":visible") && (selected = el.children(".selected")).length === 1 &&
									input.val( selected.attr("value") ).trigger("input");
								

								// Blur regardless of the existence of following input and Focus Next Input
								var next = input.blur().next();

								if( next.length ){
									next.focus();
								}else{

									// Parameter
									(next = new Parameter()).$.appendTo(container);
									next.name.focus();

									// Update Collection
									collection.update();
								}
							}

							// Down / Up
							if( el.is(":visible") && (e.keyCode === 40 || e.keyCode === 38) ){
								e.preventDefault();
								var direction = e.keyCode === 40 ? "next" : "prev";

								// If Select is Found
								return ( selected = el.children(".selected") )[direction]().length &&

									// Select Next or Previous One
									( selected = selected.removeClass("selected")[direction]().addClass("selected") ) &&

									// Set Placeholder													
									input.attr("placeholder", selected.attr("value")).trigger("adjustWidth");
							}

						}
					}) ) && this;
		},

		// Create List
		setLis: function(setLis){
			return (datalist = $.isArray(setLis) ? setLis : Object.keys(setLis) ) && renderLis() && this;
		},

		// Set Offset of Dropdown
		show: function(offset){

			// Don't display if there's nothing to display
			if( datalist.length === 0 ){ return; }

			// jQuery can't properly set the offset of a hidden element; show first
			el
				.show()
				.offset({
					top:offset.top+input.height(),
					left:offset.left  - (padding || 0)
				});
		}
	};
})();