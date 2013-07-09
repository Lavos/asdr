CLARITY.provide('overlay', ['jquery', 'doubleunderscore'], function($, __){
	var Overlay = function Overlay () {
		var self = this;

		self.element = document.createElement('div');
		self.iframe = document.createElement('iframe');
		self.$element = $(self.element);
		self.element.appendChild(self.iframe);
		document.body.appendChild(self.element);
	};

	__.augment(Overlay, __.PubSubPattern);
	Overlay.prototype.global_name = 'overlay';

	Overlay.prototype.open = function open () {
		var self = this;

		self.$element.addClass('show');
		self.fire('open');
	};

	Overlay.prototype.close = function close () {
		var self = this;

		self.$element.removeClass('show');
		self.fire('close', 'bananas', 'apples', 'frogs');
	};

	Overlay.prototype.setSrc = function setSrc (src) {
		var self = this;

		self.iframe.src = src;
	};

	var foo = 123;

	return {
		open: function () { console.log('foo!'); },
		close: function () {},
		setSrc: function (setSrc) {} 
	}

	return new Overlay();
});
