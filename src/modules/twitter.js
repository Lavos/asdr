CLARITY.provide('twitter', ['doubleunderscore', 'module_helper'], function(__, module_helper){
	var TwitterManager = function TwitterManager () {
		var self = this;

		self.stash = new __.Stash();
	
		var t;
		window.twttr = window.twttr || (t = { _e: [], ready: function(f){ t._e.push(f) } });

		window.twttr.ready(function(){
			self.jsapi = window.twttr;
			self.fire('ready');
			self.stash.purge();
		});

		__.addJS('https://platform.twitter.com/widgets.js');
	};

	__.augment(TwitterManager, __.PubSubPattern);
	
	TwitterManager.prototype.global_name = 'twitter';
	TwitterManager.prototype.push = module_helper.workobj_push;

	return new TwitterManager();
});
