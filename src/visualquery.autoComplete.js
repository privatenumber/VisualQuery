// Create autoComplete Class
var autoComplete = (function(options){
	var input, lis, padding,
	
		// Render autoComplete List
		dom = $("<ul>", {"class":"autoComplete"})

				.css({
					'position': 'absolute',
					'display': 'none'
				})

				// Hover implemented in CSS because '.selected' is an identifier
				.on("mouseover", "li", function(){

					// Remove Selected
					$(this).siblings(".selected").removeClass("selected");

					// Select
					$(this).addClass("selected");
				})

				// Can't be click because input will be blurred
				.on("mousedown", "li", function(e){
					e.preventDefault();

					input.val($(e.target).attr("value")).blur().next("input").focus();
				}),
		renderLis = function(){
			var first = false;

			dom.html(lis.map(function(li){

				// If Typed Doesn't match, Don't show
				if( !li.match(input.val()) ){ return false; }

				return $("<li>", {
					"text": li,

					//Automatically Select First one if strict
					"class": ( ( options.strict === true && first === false && (first = true) ) ? "selected" : "" )
				}).attr("value", li);
			}));

			// Dynamic Padding adapting to CSS
			padding = padding || parseInt(dom.find("li").css("padding-left"));

			return 1;
		};


	return {

		// Create DOM
		$: dom,

		// Set Target Input
		// Pass in Input Element so that it can enter values when li is clicked
		targetInput: function(target){
			return (input = $(target)) && this;
		},

		// Create List
		setLis: function(setLis){
			return (lis = setLis) && renderLis() && this;
		},

		// Set Offset of Dropdown
		show: function(offset){
			// jQuery can't properly set the offset of a hidden element; show first
			dom
				.show()
				.offset({
					top:offset.top+input.height(),
					left:offset.left  - (padding || 0)
				});
		}
	};
})(options);