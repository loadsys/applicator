(function($) {
$(document).ready(function() {
	var plugins = ['content', 'params', 'camelCase', 'caseCamel'];
	$(document).applicator(plugins, {
		'content': function(el, opt) {
			el.content(opt);
		}
	});
});
})(jQuery);