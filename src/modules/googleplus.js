provide('googleplus', ['doubleunderscore', 'module_helper'], function(__, module_helper){
	var GooglePlusManager = function GooglePlusManager () {
		var self = this;

		self.stash = new __.Stash();
	
		var function_id = __.sprintf('gpOnLoad_%s', (+new Date()));
		window[function_id] = function(){
			self.jsapi = window.gapi;
			self.fire('ready');
			self.stash.purge();
		};

		__.addJS(__.sprintf('https://apis.google.com/js/client:plusone.js?onload=%s', function_id));
	};

	__.augment(GooglePlusManager, __.PubSubPattern);
	
	GooglePlusManager.prototype.global_name = 'googleplus';
	GooglePlusManager.prototype.push = module_helper.workobj_push;
 
	return new GooglePlusManager();
});
