// This plugin allows you to specify a comma separated string or an array
// of plugins to load. The tags that these plugins should apply to will be
// found by whether or not they have a data-{pluginName} attribute. Passing
// a object in the data-{pluginName} attribute will translate to the options
// for the plugin.
//
// In the initial call, the second parameter can be a hash of plugin names for
// keys and functions for their values. Those function will be called instead
// of the plugin name on the selected element. This allows you to customize the
// plugin instantiation on a per plugin basis but still globally for all tags.
//
// Example:
// $(document).applicator(['plugin1, plugin2'], {
//		 'plugin1': function($el, opt) {
//				 $el.plugin1(opt);
//				 $el.differentPluginInitialization();
//		 }
// });
//
// Also can just use this as a way to apply plugins to elements without any
// of the extra boiler plate you'd normally have.
//
// $(document).applicator(["button"]);
//
// <a data-button href="#">This will be a button</a>
//
// Any markup that has data-button attribute will get $.fn.button method called
// on it (assuming it is available).
//
(function ($) {

	var loader, methods, camelCase, hyphenate, check, cachedPlugins;

	// Hash of callback methods keyed by the plugin name that the method
	// belongs to.
	loader = {};

	// Polyfill for indexOf for IE.
	Array.prototype.indexOf=[].indexOf||function(a,b,c,r){for(b=this,c=b.length,r=-1;~c;r=b[--c]===a?c:r);return r}

	// Takes a string and converts hyphenated words to camel
	// case version. Returns the camel case if hyphens exist
	// and returns the passed in string if not.
	camelCase = function (str) {
		var split = str.split('-'), ret = '', i, len;
		if (split.length > 1) {
			ret = split[0];
			for (i = 1, len = split.length; i < len; i += 1) {
				ret = ret + split[i].charAt(0).toUpperCase() + split[i].slice(1);
			}
		} else {
			ret = str;
		}
		return ret;
	};


	// Takes a string and converts a camelCase string to a
	// hyphenated version. Returns the hyphenated string
	hyphenate = function (str) {
		var ret = '', i, len;
		for (i = 0, len = str.length; i < len; i += 1) {
			if (str.charAt(i) == str.charAt(i).toUpperCase()) {
				ret = ret + '-' + str.charAt(i).toLowerCase();
			} else {
				ret = ret + str.charAt(i);
			}
		}
		return ret;
	};

	// Takes the attribute minus the data- and the array
	// of plugins. Will convert the key to different versions
	// to find which version exists in the plugins array.
	// Returns the version that is stored in the array.
	check = function (key, plugins) {
		var hyphen = hyphenate(key)
			, camel = camelCase(key)
			, lower = camelCase(key)
			, i, len
		lower.toLowerCase();
		if (plugins[plugins.indexOf(key)]) {
			return plugins[plugins.indexOf(key)];
		}
		if (plugins[plugins.indexOf(hyphen)]) {
			return plugins[plugins.indexOf(hyphen)];
		}
		if (plugins[plugins.indexOf(camel)]) {
			return plugins[plugins.indexOf(camel)];
		}
		if (plugins[plugins.indexOf(lower)]) {
			return plugins[plugins.indexOf(lower)];
		}
		for (i = 0, len = plugins.length; i < len; i += 1) {
			if (plugins[i].toLowerCase() == lower) {
				return plugins[i];
			}
		}
		return false;
	};

	// Methods used by the applicator plugin
	methods = {
		init: function ($this, plugins) {
			return $this.each(function (index) {
				var self = $(this)
					, attrs = self[0].attributes
					, data = {}
					, attrName, dataKey, plugin, i, len;
				for (i = 0, len = attrs.length; i < len; i += 1) {
					attrName = attrs[i].nodeName;
					dataKey = attrName.replace(/data-/, '');
					plugin = check(dataKey, plugins);
					// Call continue early if attr isn't a data- attr
					if (!attrName.match(/data-(.)*/) || !plugin) {
						continue;
					}
					// Get data from attribute or set it to empty object
					if (self.attr(attrName).search(/^\{(.*)\}$/) != -1) {
						data = $.parseJSON(self.attr(attrName)) || {};
					} else {
						data = self.attr(attrName) || {};
					}
					// Check if a callback for the plugin has been created
					if (typeof loader[plugin] === "function") {
						loader[plugin].apply(this, [self, data]);
					} else {
						// Check if the plugin exists on $.fn
						if (typeof self[plugin] === "function") {
							self[plugin].apply(self, [data]);
						}
					}
				}
			});
		}
	};

	// Adding the pluginLoader the the jQuery.fn. The plugin takes
	// an array or comma separated string of plugins to be searched for
	// and applied to elements. The plugins array should be spelled
	// exactly as the plugin is named. This method will convert the
	// array to a jQuery selector, containing both hyphenated and
	// single string toLowerCase versions of the plugins.
	//
	// @param mixed plugins
	// @param object options
	// @return this
	$.fn.applicator = function (plugins, options) {
		var find;
		if (!plugins && !cachedPlugins) {
			return this;
		} else if (!plugins && cachedPlugins) {
			plugins = cachedPlugins;
		} else {
			if (typeof plugins === 'string') {
				plugins = plugins.split(',').map(function (el) { return el.trim(); });
			} else if (plugins instanceof Array) {
				plugins = $.map(plugins, function (el) { return $.trim(el); });
			}
		}
		loader = $.extend(loader, options);
		// Cache the plugins
		if (!cachedPlugins) {
			cachedPlugins = plugins;
		}
		find = $.map(plugins, function (el) {
			return '[data-' + hyphenate(el) + '], [data-' + camelCase(el).toLowerCase() + ']';
		}).join(', ');
		// So that this doesn't get reassigned multiple times, check if it doesn't
		// exist first. Use this to call applicator on ajax loaded content.
		methods.init(this.find(find), plugins);
		return this;
	}

})(jQuery);