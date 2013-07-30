CLARITY.provide('plugin', ['doubleunderscore'], function(__){
	var Plugin = function Plugin () {};

	__.augment(Plugin, __.PubSubPattern);

	Plugin.prototype.load = function load (url, work_obj) {
		__.addJS(url, function(){
			CLARITY.push(work_obj);
		});
	};

	return new Plugin();
});
