/**
 * This plugin allows you to specify a comma separated string or an array
 * of plugins to load. The tags that these plugins should apply to will be
 * found by whether or not they have a data-{pluginName} attribute. Passing
 * a object in the data-{pluginName} attribute will translate to the options
 * for the plugin. 
 *
 * In the initial call, the second parameter can be a hash of plugin names for
 * keys and functions for their values. Those function will be called instead
 * of the plugin name on the selected element. This allows you to customize the
 * plugin instantiation on a per plugin basis but still globally for all tags.
 *
 * Example: 
 * $(document).pluginLoader('plugin1, plugin2', {
 *     'plugin1': function(el, opt) {
 *         el.plugin1(opt);
 *         el.differentPluginInitialization();
 *     }
 * });
 *
 */
(function($) {
var loader = {};
var methods = {
	init: function($this, plugins) {
		return $this.each(function(index) {
			var self = $(this);
			var attrs = self[0].attributes;
			for (var i = 0; i < attrs.length; i++) {
				var attrName = attrs[i].nodeName;
				var parsed = attrs[i].nodeName.replace(/data-/, '');
				if (parsed != camelCase(parsed)) {
					var data = self.data(parsed);
					self.removeData(parsed);
					parsed = camelCase(parsed);
					self.data(parsed, data);
				}
				if (!attrName.match(/data-(.)/) || plugins.indexOf(parsed) === -1) {
					continue;
				}
				if (loader[parsed]) {
					loader[parsed](self, self.data(parsed));
				} else {
					if (self[parsed]) {
						self[parsed](self.data(parsed));
					}
				}
			}
		});
	}
};
function camelCase(str) {
	var split = str.split('-');
	var ret = '';
	if (split.length > 1) {
		ret = split[0];
		for (var i = 1; i < split.length; i++) {
			ret = ret + split[i].charAt(0).toUpperCase() + split[i].slice(1);
		}
	}
	return ret;
}
function hyphenate(str) {
	var ret = '';
	for (var i = 0; i < str.length; i++) {
		if (str.charAt(i) == str.charAt(i).toUpperCase()) {
			ret = ret + '-' + str.charAt(i).toLowerCase();
		} else {
			ret = ret + str.charAt(i);
		}
	}
	return ret;
}
$.fn.pluginLoader = function(plugins, options) {
	if (typeof plugins === 'string') {
		plugins = plugins.split(',').map(function(el) { return el.trim(); });
	} else if (plugins instanceof Array) {
		plugins = plugins.map(function(el) { return el.trim(); });
	}
	loader = $.extend(loader, options);
	var find = plugins.map(function(el) { return '[data-'+hyphenate(el)+']'; }).join(', ');
	console.log('Method call: methods.init($(\''+find+'\', this), plugins);');
	methods.init($(find, this), plugins);
	return this;
}
})(jQuery);