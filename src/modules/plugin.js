CLARITY.provide('plugin', ['doubleunderscore'], function(__){
	var Plugin = function Plugin () {};

	__.augment(Plugin, __.PubSubPattern);

	Plugin.prototype.load = function load (url, work_obj) {
		var self = this;

		__.addJS(url, function(){
			self.fire('load', url);
			CLARITY.push(work_obj);
		});
	};

	return new Plugin();
});
