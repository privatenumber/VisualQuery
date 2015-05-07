module.exports = (function(){
	'use strict';

	function E(lement){
		this._ = lement;
	}

	E.prototype.addClass = function addClass(className){
		var split = className.split(" ");

		for( var i = 0; i < split.length; i++ ){
			if( !split[i] ){ continue; }
			if( this._.classList ){ this._.classList.add(split[i]); }
			else{ this._.className = split[i]; }
		}
		return this;
	};

	E.prototype.removeClass = function removeClass(className){
		if( this._.classList ){ this._.classList.remove(className); }
		else{
			this._.className = this._.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
		}
		return this;
	};

	E.prototype.hide = function hide(){
		if( this._.style.display !== "none" ){
			this._.style.display = "none";
		}
		return this;
	};

	E.prototype.show = function show(){
		if( this._.style.display !== "block" ){
			this._.style.display = "block";
		}
		return this;
	};

	E.prototype.shown = function shown(){
		return this._.style.display !== "none";
	};

	E.prototype.on = function on(eventNames, eventCallback, useCapture){

		useCapture = !!useCapture;
		eventNames = eventNames.split(" ");

		for( var i = 0, len = eventNames.length; i < len; i++ ){
			this._.addEventListener(eventNames[i], eventCallback, useCapture);
		}

		return this;
	};

	E.prototype.off = function off(eventNames, eventCallback){

		eventNames = eventNames.split(" ");

		for( var i = 0, len = eventNames.length; i < len; i++ ){
			this._.removeEventListener(eventNames[i], eventCallback);
		}

		return this;
	};

	E.prototype.one = function one(eventName, eventCallback){
		var self = this;
		return this.on(eventName, function cb(){
			self.off(eventName, cb);
			eventCallback.apply(this, [].slice.apply(arguments));
		});
	};

	E.prototype.append = function append(arr){

		var args = arr instanceof Array ? arr : arguments;

		for( var i = 0, len = args.length; i < len; i++ ){
			this._.appendChild( args[i] instanceof E ? args[i]._ : args[i] );
		}

		return this;
	};

	E.prototype.replaceWith = function replaceWith(el){

		el = el instanceof E ? el._ : el;

		if( this._.parentNode ){
			this._.parentNode.replaceChild(el, this._);
		}

		this._ = el;

		return this;
	};

	E.prototype.text = function text(textContent, append){

		var el = this.textWrap || this._;

		if( arguments.length === 0 ){ return el.textContent; }

		// Change text  
		// textContent is faster than innerText
		// but textContent isn't aware of style
		// line breaks dont work

		// Back to textContent - firefox doesn't support innertext...
		el.textContent = (append ? el.textContent : "") + textContent;

		return this;
	};

	E.prototype.html = function html(htmlContent, append){

		// Change html
		this._.innerHTML = (append ? this._.innerHTML : "") + htmlContent;

		return this;
	};


	E.prototype.attr = function attr(name, value){

		if( typeof name !== "string" ){ throw new Error("An attribute name is required"); }

		if( typeof value !== "string" ){ return this._.getAttribute(name); }

		this._.setAttribute(name, value);

		return this;
	};

	E.prototype.remove = function remove(){
		if( !this._.parentNode ){ return; }
		this._.parentNode.removeChild(this._);

		return this;
	};


	E.prototype.offset = function offset(top, left){

		this._.style.top = top;
		this._.style.left = left;

		return this;
	};

	E.prototype.css = function css(name, value){

		if( typeof name === "string"){
			if( typeof value === "string" ){
				this._.style[name] = value;
			}else{
				return getComputedStyle(this._)[name];
			}
		}
		else if( name instanceof Object ){
			for( var prop in name ){
				this._.style[prop] = name[prop];
			}
		}

		return this;
	};

	E.prototype.trigger = function trigger(eventName){

		var evnt = new Event(eventName);

		this._.dispatchEvent(evnt);

		return this;
	};


	E.prototype.prev = function prev(){
		if( this._.previousSibling ){
			return new E(this._.previousSibling);	
		}
	};
	E.prototype.next = function next(){
		if( this._.nextSibling ){
			return new E(this._.nextSibling);	
		}
	};

	return function (el, opts){

		// Ignore if already an instance
		if( el instanceof E ){ return el; }

		var instance = new E();

		// el is a string
		if( typeof el === "string" ){

			// Create element
			instance._ = document.createElement(el);

			if( typeof opts === "object" ){

				var _opts = Object.create(opts);


				// Text container element
				if( typeof _opts.textWrap === "string" ){

					instance.textWrap = document.createElement(_opts.textWrap);
					instance._.appendChild( instance.textWrap );
					_opts.textWrap = null;
				}

				// Inner text
				if( _opts.text !== undefined && opts.text !== null ){
					instance.text(_opts.text);
					_opts.text = null;
				}

				// Inner HTML
				if( typeof _opts.html === "string" ){
					instance.html(_opts.html);
					_opts.html = null;
				}

				// Add Class
				if( typeof _opts.class === "string" ){
					instance.addClass(_opts.class);
					_opts.class = null;
				}

				// Set everything else as an attribute
				for( var at in _opts ){
					if( _opts[at] ){
						instance._.setAttribute(at, _opts[at]);
					}
				}
			}
		}else{
			instance._ = el;
		}

		return instance;
	};
})();