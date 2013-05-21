LUCID.provide('ads', ['jquery', 'underscore', 'doubleunderscore'], function($, _, __){
	var window_width = __.dims().x;
	console.log(window_width);

	function insertGPT (callback) {
		// add async GPT javascript to page
		var gpt_script = document.createElement('script');
		gpt_script.async = true;
		gpt_script.type = 'text/javascript';

		var useSSL = 'https:' == document.location.protocol;
		var js_file = window_width < 728 ? 'gpt_mobile.js' : 'gpt.js';
		gpt_script.src = (useSSL ? 'https:' : 'http:') + '//www.googletagservices.com/tag/js/' + js_file;
		gpt_script.src = '//www.googletagservices.com/tag/js/gpt.js';

		__.onLoad(gpt_script, function(){
			googletag.pubads().collapseEmptyDivs();
			googletag.pubads().enableAsyncRendering();
			googletag.pubads().enableSingleRequest();
			googletag.enableServices();
			callback();
		});

		var node = document.getElementsByTagName('script')[0];
		node.parentNode.insertBefore(gpt_script, node);
	};

	// Ad Constructor
	var Ad = function Ad (params) {
		var self = this;

		var defaults = {
			sizes: [],
			position: '',
			tile: '',
			element: null
		};

		self.options = _.defaults(params, defaults);
		self.element = self.options.element || document.createElement('div');
		self.id = (self.element.id ? self.element.id : self.element.id = _.uniqueId('ad_'));
		self.gpt_slot = null;
	};

	__.augment(Ad, __.PubSubPattern);

	Ad.prototype.display = function display (network_code, site_code, zone) {
		var self = this;

		googletag.cmd.push(function(){
			console.log('display!');
			var adSlot = googletag.defineSlot('/'+network_code+'/'+site_code+'/'+zone, self.options.sizes, self.id);
			console.dir({
				network_code: network_code,
				site_code: site_code,
				zone: zone,
				sizes: self.options.sizes,
				id: self.id
			});

			adSlot.addService(googletag.pubads());
			adSlot.setTargeting("pos", self.options.position);
			adSlot.setTargeting("tile", self.options.tile); // Please verify that this is being used.
			googletag.display(self.id); // requests for this ad

			self.gpt_slot = adSlot;
			self.fire('display');
			console.log(adSlot);
		});
	};

	Ad.prototype.refresh = function refresh () {
		var self = this;

		googletag.pubads().refresh([self.ad_slot]);
		self.fire('refresh');
	};


	// used as a singleton
	var AdManager = function AdManager () {
		var self = this;

		self.site_code = ''; // site ID passed by initialize
		self.zone = ''; // page type passed by initialize
		self.network_code = 4700;

		self.stash = new __.Stash();
		self.ad_list = [];
		self.ads_by_id = {};

		insertGPT(function(){
			console.log('stash purge');
			self.stash.purge();
		});

		console.dir(self);
	};

	__.augment(AdManager, __.PubSubPattern);

	AdManager.prototype.populate = function populate (selector) {
		var self = this;

		$(selector).each(function(){
			var $this = $(this);

			self.createAd({
				sizes: $this.data('sizes'),
				position: $this.data('position'),
				tile: $this.data('tile'),
				element: this
			});
		});
	};

	AdManager.prototype.createAd = function createAd (params) {
		var self = this;

		self.stash.push(function(){
			console.log('making new ad');
			var new_ad = new Ad(params);
			console.dir(new_ad);

			self.ad_list.push(new_ad);
			self.ads_by_id[new_ad.id] = new_ad;
			self.fire('create_ad', new_ad);
			new_ad.display(self.network_code, self.site_code, self.zone);
		});
	};

	AdManager.prototype.refresh = function refresh (id) {
		var self = this;

		console.log('refresh!');

		if (typeof id === 'undefined') {
			var slots = [], affected_ads = [];
			var counter = 0, limit = self.ad_list.length;
			while (counter < limit) {
				var current = self.ad_list[counter];
				slots.push(current.gpt_slot);
				affected_ads.push(current);
				counter++;
			};

			googletag.pubads().refresh(slots);
			_.invoke(affected_ads, 'fire', 'refresh');
			self.fire('refresh', affected_ads);
		} else if (self.ads_by_id.hasOwnProperty(id)) {
			self.ads_by_id[id].refresh();
			self.fire('refresh', [self.ads_by_id[id]]);
		};

	};

	return new AdManager();
});
