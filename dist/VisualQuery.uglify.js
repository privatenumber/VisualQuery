/*! VisualQuery 2014-05-21 */
(function($) {
    $.fn.focus = function(data, fn) {
        "use strict";
        if (!this[0]) {
            return;
        }
        if (arguments.length >= 1 && Array.prototype.every.call(arguments, function(e) {
            return Math.floor(e) === e;
        })) {
            if (this[0].setSelectionRange) {
                try {
                    return this[0].setSelectionRange(data, fn || data);
                } catch (e) {
                    return this.trigger("focus");
                }
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
            placeholder: "",
            callback: $.noop()
        }, options);
        var callback = function() {
            options.callback(collection.list.map(function(e) {
                return e.validate() && {
                    name: e.name.val(),
                    operator: datalists[e.name.val() + "_operators"] && datalists[e.name.val() + "_operators"][e.operator.val()] || e.operator.val(),
                    value: datalists[e.name.val() + "_values"] && datalists[e.name.val() + "_values"][e.value.val()] || e.value.val()
                };
            }).filter(function(e) {
                return e;
            }));
        }, placeholder = $("<div></div>", {
            "class": "placeholder",
            style: "pointer-events: none;" + (options.defaultQuery.length ? "display:none" : ""),
            text: options.placeholder
        }), container = $("<div>", {
            "class": "parameters",
            html: placeholder
        }).on({
            focusin: function() {
                container.addClass("selected");
            },
            focusout: function() {
                container.removeClass("selected");
            },
            mousedown: function(e) {
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
                collection.update();
            }
        }), collection = {
            list: [],
            update: function() {
                var self = this, children = container.children("div.parameter");
                this.list = [];
                placeholder[children.length ? "hide" : "show"]();
                children.each(function() {
                    self.list.push($(this).data("Parameter"));
                });
                return this;
            }
        }, parameters = {}, datalists = {
            names: []
        };
        options.parameters.forEach(function(parameter) {
            parameters[parameter.name] = parameter;
            datalists.names.push(parameter.name);
            datalists[parameter.name + "_operators"] = parameter.operators && parameter.operators;
            datalists[parameter.name + "_values"] = parameter.values && parameter.values;
        });
        var autoComplete = function() {
            var input, datalist, padding, el = $("<ul>", {
                "class": "autoComplete"
            }).css({
                position: "absolute",
                display: "none"
            }).on("mouseover", "li", function() {
                var select = $(this).addClass("selected");
                select.siblings(".selected").removeClass("selected");
                input.attr("placeholder", select.attr("value")).trigger("adjustWidth");
            }).on("mousedown", "li", function(e) {
                e.preventDefault();
                input.removeAttr("placeholder").val($(this).attr("value")).trigger("input").blur().next().focus();
            }), renderLis = function() {
                var index = el.children(".selected"), select = index.index() !== -1 ? index : 0, list = datalist.map(function(li, idx) {
                    if (!li.match(new RegExp(input.val(), "i"))) {
                        return;
                    }
                    return $("<li>", {
                        text: li,
                        "class": select === idx ? input.attr("placeholder", li).trigger("adjustWidth") && "selected" : ""
                    }).attr("value", li);
                }).filter(function(elem) {
                    return elem;
                });
                padding = padding || parseInt(el.find("li").css("padding-left"));
                return list.length ? el.html(list).show() : el.hide();
            };
            return {
                $: el,
                targetInput: function(target) {
                    return (input = $(target).on({
                        input: renderLis.bind(this),
                        blur: function() {
                            $(this).unbind("keydown input");
                        },
                        keydown: function(e) {
                            var input = $(this), selected;
                            if (e.keyCode === 13) {
                                e.preventDefault();
                                e = el.is(":visible") && (selected = el.children(".selected")).length === 1 && input.val(selected.attr("value")).trigger("input");
                                input.blur().next().focus();
                            }
                            if (el.is(":visible") && (e.keyCode === 40 || e.keyCode === 38)) {
                                e.preventDefault();
                                var direction = e.keyCode === 40 ? "next" : "prev";
                                return (selected = el.children(".selected"))[direction]().length && (selected = selected.removeClass("selected")[direction]().addClass("selected")) && input.attr("placeholder", selected.attr("value")).trigger("adjustWidth");
                            }
                        }
                    })) && this;
                },
                setLis: function(setLis) {
                    return (datalist = $.isArray(setLis) ? setLis : Object.keys(setLis)) && renderLis() && this;
                },
                show: function(offset) {
                    if (datalist.length === 0) {
                        return;
                    }
                    el.show().offset({
                        top: offset.top + input.height(),
                        left: offset.left - (padding || 0)
                    });
                }
            };
        }();
        var caretLeft = function(el) {
            try {
                return el.selectionStart === 0 && el.selectionEnd === 0;
            } catch (e) {
                return false;
            }
        }, caretRight = function($, el) {
            try {
                return $.val().length === el.selectionStart && $.val().length === el.selectionEnd;
            } catch (e) {
                return false;
            }
        };
        var Parameter = function(name, operator, value) {
            var self = this;
            this.remove = function() {
                self.$.remove();
                collection.update();
                callback();
            };
            this.validate = function() {
                var name = self.name.val(), operator = self.operator.val(), value = self.value.val();
                if (!(name + operator + value).length) {
                    return self.remove() && false;
                }
                if (!name.length || !operator.length || !value.length) {
                    self.$.addClass("error");
                    return false;
                }
                if (options.strict && !parameters.hasOwnProperty(name)) {
                    return self.$.addClass("error").attr("title", "Invalid Parameter") && false;
                }
                if (!self.value[0].checkValidity()) {
                    return self.$.addClass("error").attr("title", self.value[0].validationMessage) && false;
                }
                return true;
            };
            this.$ = $("<div>", {
                "class": "parameter"
            }).data("Parameter", this).append($("<span></span>", {
                id: "remove",
                html: "&times;"
            }).on("click", self.remove), this.name = $("<input>", {
                type: "text",
                spellcheck: "false",
                autoComplete: "off",
                id: "name",
                value: name,
                style: "width:1px;"
            }).on({
                focus: function() {
                    autoComplete.setLis(datalists.names).show($(this).offset());
                },
                blur: function() {
                    var name = self.name.val(), settings = parameters[name] || {};
                    self.operator.attr(jQuery.extend({
                        placeholder: ""
                    }, settings.operatorAttrs || {}, {
                        type: "text"
                    })).trigger("input");
                    self.value.attr(jQuery.extend({
                        placeholder: ""
                    }, settings.valueAttrs || {}, {
                        type: [ "text", "email", "number", "url" ].indexOf(settings.type) !== -1 && settings.type || "text"
                    })).trigger("input");
                }
            }), this.operator = $("<input>", {
                type: "text",
                spellcheck: "false",
                autoComplete: "off",
                id: "operator",
                value: operator,
                style: "width:1px;"
            }).on("focus", function() {
                autoComplete.setLis(datalists[self.name.val() + "_operators"] || []).show($(this).offset());
            }), this.value = $("<input>", {
                type: "text",
                spellcheck: "false",
                autoComplete: "off",
                id: "value",
                value: value,
                style: "width:10px;"
            }).on("focus", function() {
                autoComplete.setLis(datalists[self.name.val() + "_values"] || []).show($(this).offset());
            })).on("keydown", "input#name", function(e) {
                if (caretLeft(this) && e.keyCode === 37) {
                    e.preventDefault();
                    var previous = collection.list[collection.list.indexOf(self) - 1];
                    previous = previous && previous.value.focus();
                }
            }).on("keydown", "input#value", function(e) {
                if (caretRight($(this), this) && e.keyCode === 39) {
                    e.preventDefault();
                    var next = collection.list[collection.list.indexOf(self) + 1];
                    next = next && next.name.focus(0);
                }
            }).on({
                keydown: function(e) {
                    var input = $(this);
                    if (caretRight(input, this) && e.keyCode === 39) {
                        e.preventDefault();
                        input.next().focus(0);
                    }
                    if (caretLeft(this) && (e.keyCode === 37 || e.keyCode === 8)) {
                        e.preventDefault();
                        input.prev().focus();
                    }
                },
                blur: function() {
                    self.$.removeClass("selected");
                    self.validate();
                    autoComplete.$.hide();
                    callback();
                },
                focus: function() {
                    self.$.removeClass("error").addClass("selected");
                    autoComplete.targetInput(this);
                },
                "input adjustWidth": function() {
                    var padding = {
                        number: 17
                    };
                    var $this = $(this), value = $this.val(), useText = value.length !== 0 ? value : $this.attr("placeholder") || "";
                    var shadow = $("<span>", {
                        "class": options["class"]
                    }).css(jQuery.extend({
                        position: "absolute",
                        width: "auto",
                        visibility: "hidden",
                        whiteSpace: "pre"
                    }, $this.css([ "font-size", "font-family", "font-weight", "font-style", "font-variant", "word-spacing", "letter-spacing", "text-indent", "text-rendering", "text-transform" ]))).text(useText).appendTo(container), width = shadow.width();
                    shadow.remove();
                    $this.width((width || 10) + 1 + (padding[$this.attr("type")] || 0));
                }
            }, "input");
        };
        this.html([ container, autoComplete.$ ]);
        options.defaultQuery.forEach(function(parameter) {
            if (options.strict && !(parameter.name in parameters)) {
                return;
            }
            parameter = new Parameter(parameter.name, parameter.operator, parameter.value, parameter.type);
            parameter.$.appendTo(container);
            parameter.name.trigger("blur").trigger("adjustWidth");
            parameter.operator.trigger("adjustWidth");
            parameter.value.trigger("adjustWidth");
            collection.update();
        });
        callback();
    };
})(window.jQuery);