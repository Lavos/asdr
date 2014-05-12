__LIBRARY_NAME__.provide('embed', [], function(){
	var __ = {};

	__.extend = function (obj) {
		var objects = Array.prototype.slice.call(arguments, 1);
		var counter = 0, limit = objects.length;

		while (counter < limit) {
			var current = objects[counter];

			for (var prop in current) {
				obj[prop] = current[prop];
			};

			counter++;
		};

		return obj;
	};

	__.template = (function template () {
		var defaults = {
			evaluate: /\[!([\s\S]+?)!\]/g,
			interpolate: /\[!=([\s\S]+?)!\]/g,
			varname: 'dt'
		};

		var template = function template (str, templatesettings) {
			var c = {};
			__.extend(c, defaults, templatesettings);

			var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
			'__p.push(\'' +
			str.replace(/\\/g, '\\\\')
			.replace(/'/g, "\\'")
			.replace(c.interpolate, function(match, code) { return "'," + code.replace(/\\'/g, "'") + ",'"; })
			.replace(c.evaluate || null, function(match, code) { return "');" + code.replace(/\\'/g, "'").replace(/[\r\n\t]/g, ' ') + "__p.push('"; })
			.replace(/\r/g, '\\r')
			.replace(/\n/g, '\\n')
			.replace(/\t/g, '\\t')
			+ "');return __p.join('');";

			try {
				return new Function(c.varname, 'extra', tmpl);
			} catch (e) {
				throw e;
			};
		};

		return template;
	})();

	__.addStyle = function addStyle (rules) {
		var head = document.getElementsByTagName('head')[0];
		var style_element = document.createElement('style');
		style_element.type = 'text/css';

		if (style_element.styleSheet) {
			style_element.styleSheet.cssText = rules_blob;
		} else {
			style_element.appendChild(document.createTextNode(rules_blob));
		};

		head.appendChild(style_element);
		return style_element;
	};

	return __;
});
