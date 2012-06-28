# jQuery Applicator Plugin

This jQuery plugin is used to automatically apply other jQuery plugins, or handler methods, to elements unobtrusively.

## Usage

First create a comma separated string or array of plugin names (or handler method names):

```javascript
var plugins = ["button", "datepicker", "custom"];
```

In this example, I'll be applying the button and datepicker jQuery UI plugins to elements. The custom item will be a function on the handlers object. The applicator plugin takes a second, option param which is an object of handler methods:

```javascript
var handlers = {
	custom: function ($el, data) {
		console.log(data.content);
	}
};
```

The handler method will be called for each element that matches the selector criteria. The first parameter passed to the handler method will be the jQuery object that matches. The second param is the data that was set in the elements attribute (more on that in a bit).

The last step to get this going will be to call the applicator plugin on some element. On page load, you'll likely call this on $(document) so that all elements on the page are evaluated.

```javascript
$(function () {
	$(document).applicator(plugins, handlers);
});
```

This will analyze the plugins and create a selector (scoped to the element that the applicator plugin was called on), and then call the plugin on the matching elements. To make an element match, you simply add the data-plugin-name attribute to the element. If there is extra data to pass to the plugin (or handler function), you would add that as the value to the attribute.

```html
<a href="#" data-button='{"icons: {"primary": "ui-icon-locked"}}'>Button</a>
<input type="date" data-datepicker>
<div data-custom='{"content": "Custom handler called"}'>...</div>
```

Now the plugins will be applied without the need to write all the selectors manually. This encourages you write code as jQuery plugins which makes for more testable and reusable javascript.

To be able to apply the plugins and handlers to content loaded via $.ajax, the plugins and handlers are cached internally. Here is a simple $.ajax request to demonstrate how to apply plugins to loaded content (assuming the response of the ajax call is an html snippet).

```javascript
$.ajax({
	url: "path/to/snippet",
	type: "get",
	dataType: "html",
	success: function (response) {
		var content  = $(response);
		content.applicator();
		content.appendTo("#content");
	}
});
```

As long as applicator had already been called once with plugins and handlers, the same values will be used, but scoped to only the snippet content.
