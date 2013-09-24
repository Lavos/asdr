provide('responsive_watcher', ['jquery', 'doubleunderscore'], function($, __){
	var ResponsiveWatcher = __.inherits(__.PubSubPattern, function ResponsiveWatcher () {
		var self = this;

		self.timer = null;
		self.is = null;

		var dims = __.dims();
		self.previousWidth = dims.x;
		self.previousHeight = dims.y;
		self.previousDevice = null;

		$(window).on('resize orientationchange', function(){
			if (self.timer) {
				clearTimeout(self.timer);
			};

			// debounce the resize event, let's not get nuts
			self.timer = setTimeout(function(){
				self.check();
				var dims = __.dims();

				var widthChanged = (dims.x !== self.previousWidth);
				var heightChanged = (dims.y !== self.previousHeight);
				var deviceChanged = (self.is !== self.previousDevice);

				self.fire(self.is, dims.x, self.is, heightChanged, widthChanged, deviceChanged);

				self.previousWidth = dims.x;
				self.previousHeight = dims.y;
			}, 500);
		});

		self.check();
	});

	ResponsiveWatcher.prototype.on = function on (eventname, callback, once) {
		var self = this;

		var handles = ResponsiveWatcher.__super__.on.apply(this, arguments);
		if (__.getType(handles[0]) === 'string') {
			handles = [handles];
		};

		// calls function immediately if device matches
		var counter = 0, limit = handles.length;
		while (counter < limit) {
			if (self.is === handles[counter][0]) {
				handles[counter][1].call(this, __.dims().x, self.is, true, true, true);
			};

			counter++;
		};

		return (handles.length === 1 ? handles[0] : handles);
	};

	ResponsiveWatcher.prototype.check = function check () {
		var self = this;

		self.previousDevice = self.is;
		var width = __.dims().x;

		if (width < 640) {
			self.is = 'phone';
		};

		if (width >= 640 && width < 1000) {
			self.is = 'tablet';
		};

		if (width >= 1000) {
			self.is = 'full';
		};
	};

	var rw = new ResponsiveWatcher();
	rw.global_name = 'responsive_watcher';
	return rw;
});
