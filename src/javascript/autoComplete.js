module.exports = (function(){
	
	'use strict';


	var E = require("Element");

	function Autocomplete( $parent ){

		this.$ul =	E("ul", { "class": "autoComplete" })
					.css("position", "absolute")
					.hide();

		this.lis = [];
		this.selectedLi = null;


		(this.$parent = $parent)
			.append( this.$ul )
			.on("scroll", this.adjustLocation.bind(this));



		var self = this;

		// Event based functions, must bind to self via closure
		this.onKeydown = function onKeydown(e){

			// Up
			if( e.keyCode === 38 ){

				var prev;
				if(
					// Currently selected is still displayed
					(self.selectedLi && self.selectedLi.shown()) &&
					(prev = self.selectedLi.prev()) && prev.shown()
				){
					e.preventDefault();
					self.selectLi(prev);
				}
			}

			// Down
			if( e.keyCode === 40 ){

				// If already selected, go to next
				if( self.selectedLi && self.selectedLi.shown() ){

					var next;
					if( (next = self.selectedLi.next()) && next.shown() ){
						e.preventDefault();
						self.selectLi(next);
					}

				// Select first visible li if not selected yet
				}else{

					var i;
					for( i = 0; i < self.lis.length; i++ ){

						if( self.lis[i].shown() ){
							e.preventDefault();
							self.selectLi(self.lis[i]);
							break;
						}
					}
				}
			}

			// Enter
			if( e.keyCode === 13 ){

				if( self.selectedLi && self.selectedLi.shown() ){
					self.EE.emit(
						"selected",
						self.selectedLi.text(),
						self.selectedLi.attr("value")
					);
				}else{
					self.EE.emit("selected");
				}
			}

		};

		this.onInput = function onInput(){

			// If Typed Doesn't match, Don't show
			var hidden = 0;
			for( var i = 0; i < self.lis.length; i++ ){
				if( self.lis[i].text().match(new RegExp(this.value, "i")) ){
					self.lis[i].show();
				}else{
					self.lis[i].hide();
					hidden++;
				}
			}

			// Show or hide the list
			if( hidden === self.lis.length ){ self.$ul.hide(); }
			else{ self.$ul.show(); }
		};


		this.hide = function hide(){
			self.$ul.hide();
		};

	}

	Autocomplete.prototype.adjustLocation = function adjustLocation(){

		var rectContain = this.$parent._.getBoundingClientRect(),
			rectIn = this.$input._.getBoundingClientRect();

		// If outside the visible area of scroll
		if( !(rectContain.left < rectIn.left && rectIn.left < rectContain.left + rectContain.width) ){
			this.$ul.hide(); return;
		}


		this.$ul.show().offset(0, 0);

		var	rectUl = this.$ul._.getBoundingClientRect();

		this.$ul
		.offset(
			(rectIn.top - rectUl.top + rectIn.height) + "px",
			(rectIn.left - rectUl.left) + "px"
		);
	};


	Autocomplete.prototype.selectLi = function selectLi(li){

		// Unselect currently selected
		if( this.selectedLi ){ this.selectedLi.removeClass("selected"); }

		this.selectedLi = E(li).addClass("selected");

		this.EE.emit("hover", this.selectedLi.text());

		this.adjustLocation();
	};

	Autocomplete.prototype.createLi = function createLi(text, value){
		var self = this;

		var li = 	E("li", { text: text })
					.on("mouseover", function(){ self.selectLi(this); })
					.on("mousedown", function(e){ e.preventDefault(); })
					.on("mouseup", function(){
						if( self.selectedLi && self.selectedLi.shown() ){
							self.EE.emit(
								"selected",
								self.selectedLi.text(),
								self.selectedLi.attr("value")
							);
						}
					});


		if( value ){ li.attr("value", value); }

		return li;
	};

	Autocomplete.prototype.setList = function setList(list){

		// Empty array
		this.lis.splice(0);


		if( list instanceof Array ){

			// Add every li
			for( var key in list ){
				this.lis.push( this.createLi(list[key], !(list instanceof Array) && key ) );
			}
		}

		// Reset Lis
		this.$ul.html("").append(this.lis);
	};



	Autocomplete.prototype.bindTo = function bindTo($input, list){

		// Unbind from previous input
		if( this.$input ){

			// Unbind!
			this.$input
				.off("keydown", this.onKeydown)
				.off("input", this.onInput)
				.off("blur", this.hide);

			this.$input = null;
			this.EE = null;
		}

		var EventEmitter = require("EventEmitter");

		this.EE = new EventEmitter();

		// If there are suggestions to make...
		// if( list instanceof Array && list.length > 0 ){

			this.$input =	$input
							.on("keydown", this.onKeydown)
							.on("input", this.onInput)
							.on("blur", this.hide);

			this.setList(list);
			this.adjustLocation();
			this.onInput.apply($input._);
		// }

		return this.EE;
	};





	return Autocomplete;
})();