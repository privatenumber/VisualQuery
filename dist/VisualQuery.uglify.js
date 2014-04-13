/*! VisualQuery 2014-04-13 */
(function($) {
    $.fn.focus = function(data, fn) {
        "use strict";
        if (!this[0]) {
            return;
        }
        if (arguments.length >= 1 && Array.prototype.every.call(arguments, function(e) {
            return Math.floor(e) === e && $.isNumeric(e);
        })) {
            if (this[0].setSelectionRange) {
                return this[0].setSelectionRange(data, fn || data);
            } else if (this[0].createTextRange) {
                var range = this[0].createTextRange();
                range.collapse(true);
                range.moveEnd("character", fn || data);
                range.moveStart("character", data);
                range.select();
            }
        } else if (arguments.length === 2) {
            return this.on("focus", null, data, fn);
        }
        return this.trigger("focus");
    };
    $.fn.visualquery = function(options) {
        "use strict";
        options = $.extend({
            strict: false,
            parameters: [],
            defaultQuery: [],
            callback: $.noop()
        }, options);
        var container = $("<div>", {
            "class": "parameters"
        }), parameters = {}, query = [], callback = function() {
            var json = [];
            query.forEach(function(e) {
                var obj = e.toObj();
                if (obj) {
                    json.push(obj);
                }
                return e.toObj();
            });
            options.callback(json);
        }, datalists = {
            names: []
        };
        options.parameters.forEach(function(parameter) {
            parameters[parameter.name] = parameter;
            datalists.names.push(parameter.name);
            datalists[parameter.name + "_operators"] = parameter.operators && parameter.operators;
            datalists[parameter.name + "_values"] = parameter.values && parameter.values;
        });
        var autoComplete = function(options) {
            var input, lis, padding, dom = $("<ul>", {
                "class": "autoComplete"
            }).css({
                position: "absolute",
                display: "none"
            }).on("mouseover", "li", function() {
                $(this).siblings(".selected").removeClass("selected");
                $(this).addClass("selected");
            }).on("mousedown", "li", function(e) {
                e.preventDefault();
                input.val($(e.target).attr("value")).blur().next("input").focus();
            }), renderLis = function() {
                var first = false;
                dom.html(lis.map(function(li) {
                    if (!li.match(input.val())) {
                        return false;
                    }
                    return $("<li>", {
                        text: li,
                        "class": options.strict === true && first === false && (first = true) ? "selected" : ""
                    }).attr("value", li);
                }));
                padding = padding || parseInt(dom.find("li").css("padding-left"));
                return 1;
            };
            return {
                $: dom,
                targetInput: function(target) {
                    return (input = $(target)) && this;
                },
                setLis: function(setLis) {
                    return (lis = setLis) && renderLis() && this;
                },
                show: function(offset) {
                    dom.show().offset({
                        top: offset.top + input.height(),
                        left: offset.left - (padding || 0)
                    });
                }
            };
        }(options);
        var Parameter = function(name, operator, value) {
            var self = this;
            this.$ = $("<div>", {
                "class": "parameter"
            }).append($("<span></span>", {
                id: "remove",
                html: "&times;"
            }).on("click", function() {
                self.$.remove();
            }), this.name = $("<input>", {
                type: "text",
                spellcheck: "false",
                autoComplete: "off",
                id: "name",
                value: name,
                style: "width:1px;",
                list: "names"
            }), this.operator = $("<input>", {
                type: "text",
                spellcheck: "false",
                autoComplete: "off",
                id: "operator",
                value: operator,
                style: "width:1px;"
            }), this.value = $("<input>", {
                type: "text",
                spellcheck: "false",
                autoComplete: "off",
                id: "value",
                value: value,
                style: "width:10px;"
            })).on({
                keydown: function(e) {
                    var input = $(e.target);
                    if (e.keyCode === 13) {
                        input.next().focus();
                    }
                },
                blur: function(e) {
                    autoComplete.$.hide();
                },
                input: function(e) {
                    var padding = {
                        number: 17,
                        date: 57
                    };
                    var self = $(this), value = self.val(), useText = value.length !== 0 ? value : self.attr("placeholder") || "";
                    console.log(value, value.length, self.attr("type"));
                    var shadow = $("<span>", {
                        "class": options["class"]
                    }).css(jQuery.extend({
                        position: "absolute",
                        width: "auto",
                        visibility: "hidden",
                        whiteSpace: "pre"
                    }, self.css([ "font-size", "font-family", "font-weight", "font-style", "font-variant", "word-spacing", "letter-spacing", "text-indent", "text-rendering", "text-transform" ]))).text(useText).appendTo(container), width = shadow.width();
                    shadow.remove();
                    self.width(width + (padding[self.attr("type")] || 0) + 1 + (self.attr("list") !== undefined ? 20 : 0));
                }
            }, "input");
            this.name.on("focus", function(e) {
                autoComplete.targetInput(e.target).setLis(datalists.names).show($(this).offset());
            }).on("blur", function() {
                var name = self.name.val();
                var settings = parameters[name] || {};
                self.operator.attr(jQuery.extend({
                    placeholder: ""
                }, settings.operatorAttrs || {}, {
                    type: "text",
                    list: name
                })).trigger("input");
                self.value.attr(jQuery.extend({
                    type: "text",
                    placeholder: ""
                }, settings.valueAttrs || {}, {
                    type: settings.type || settings.valueAttrs && settings.valueAttrs.type || "text",
                    list: name + "_values"
                })).trigger("input");
                if (options.strict && !parameters.hasOwnProperty(name)) {
                    return "Error";
                }
            });
            this.value.on("blur", function() {
                if (!self.value[0].checkValidity()) {
                    self.$.addClass("error");
                } else {
                    self.$.removeClass("error");
                }
            });
        };
        options.defaultQuery.forEach(function(parameter) {
            if (options.strict && !(parameter.name in parameters)) {
                return;
            }
            parameter = new Parameter(parameter.name, parameter.operator, parameter.value, parameter.type);
            parameter.$.appendTo(container);
        });
        container.on("focusin", function() {
            container.addClass("selected");
        }).on("blur", "input", function() {
            container.removeClass("selected");
        }).on("mousedown", function(e) {
            if (!$(e.target).is(container)) {
                return;
            }
            e.preventDefault();
            $("div.parameter.selected", container).removeClass("selected");
            var after;
            $("div.parameter", container).each(function() {
                var $this = $(this), position = $this.offset();
                if (position.top > e.pageY || position.top < e.pageY && e.pageY < position.top + $this.height() && position.left > e.pageX) {
                    return false;
                }
                after = $this;
            });
            var parameter = new Parameter();
            parameter.$[after !== undefined ? "insertAfter" : "prependTo"](after || this);
            parameter.name.focus();
        });
        this.html([ container, autoComplete.$ ]);
    };
})(window.jQuery);