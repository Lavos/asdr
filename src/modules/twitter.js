CLARITY.provide('twitter', ['doubleunderscore'], function(__){
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

	TwitterManager.prototype.push = function push (work_obj) {
		var self = this;

		var func = work_obj.run || function(){};
		var uses = work_obj.use || [];

		self.stash.push(func, uses, self);
	};

	return new TwitterManager();
});
