__LIBRARY_NAME__.provide('plugin', ['jquery', 'doubleunderscore'], function($, __){
	var LIBRARY = this;
	var Plugin = function Plugin () {};

	__.augment(Plugin, __.PubSubPattern);

	Plugin.prototype.loadModule = function loadModule (urls, work_obj) {
		var self = this;

		if (__.getType(urls) == 'string') {
			urls = [urls];
		};

		var sm = new __.SerialManager(urls.length, function(){
			self.fire('load_module', urls);
			LIBRARY.push(work_obj);
		});

		var counter = urls.length;
		while (counter--){
			__.addJS(urls[counter], function(){ sm.bump(); });
		};
	};

	Plugin.prototype.loadjQueryPlugin = function loadjQueryPlugin (urls, work_obj) {
		var self = this;

		if (__.getType(urls) == 'string') {
			urls = [urls];
		};

		var sm = new __.SerialManager(urls.length, function(){
			self.fire('load_jquery_plugin', urls);
			LIBRARY.push(work_obj);
		});

		var counter = urls.length;
		while (counter--){
			$.ajax({
				url: urls[counter],
				dataType: 'text',
				success: function(text){
					(new Function('jQuery', '$', 'undefined', text))($, $, void 0);
					sm.bump();
				},
				error: function(){
					sm.bump();
				}
			});
		};
	};

	return new Plugin();
});
