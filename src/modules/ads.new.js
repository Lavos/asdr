CLARITY.provide('ads', ['jquery', 'underscore', 'doubleunderscore'], function($, _, __){
	var WINDOW_WIDTH = __.dims().x;
	var IS_MOBILE = WINDOW_WIDTH < 728;

	function insertGPT (callback) {
		var src = ('https:' === document.location.protocol ? 'https:' : 'http:') + '//www.googletagservices.com/tag/js/gpt.js';

		__.addJS(src, function(){
			googletag.pubads().collapseEmptyDivs();
			googletag.pubads().enableAsyncRendering();
			// googletag.pubads().enableSingleRequest();
			googletag.enableServices();
			callback();
		});
	};

	// Ad Constructor
	var Ad = function Ad (params) {
		var self = this;

		var defaults = {
			sizes: [],
			position: '',
			tile: '',
			element: null,
			zone: '',
			id: null
		};

		self.options = _.defaults(params, defaults);
		self.element = self.options.element || document.createElement('div');

		if (self.options.id) {
			self.id = self.options.id;
		} else if (self.element.id) {
			self.id = self.element.id;
		} else {
			self.id = _.uniqueId('ad_');
		};

		self.element.id = self.id;
		self.gpt_slot = null;
	};

	__.augment(Ad, __.PubSubPattern);

	Ad.prototype.display = function display (network_code, site_code, keywords_map) {
		var self = this;

		googletag.cmd.push(function(){
			var code_path = __.sprintf('/%s/%s/%s', network_code, site_code, self.options.zone);

			if (self.options['out-of-page']) {
				var adSlot = googletag.defineOutOfPageSlot(code_path, self.id);
			} else {
				var adSlot = googletag.defineSlot(code_path, self.options.sizes, self.id);
			};

			self.gpt_slot = adSlot;

			adSlot.addService(googletag.pubads());

			adSlot.setTargeting('pos', self.options.position);
			adSlot.setTargeting('tile', self.options.tile); // Please verify that this is being used.

			_.each(keywords_map, function(value, key, dict){
				adSlot.setTargeting(key, value);
			});

			googletag.display(self.id); // requests for this ad

			self.fire('display');
		});
	};

	Ad.prototype.refresh = function refresh () {
		var self = this;

		googletag.pubads().refresh([self.gpt_slot]);
		self.fire('refresh');
	};


	// used as a singleton
	var AdManager = function AdManager () {
		var self = this;

		self.site_code = ''; // site ID
		self.zone = ''; // page type
		self.network_code = 4700;
		self.keywords = [];
		self.keyword_map = {}; // collection of extensions keywords

		self.stash = new __.Stash();
		self.ad_list = [];
		self.ads_by_id = {};

		insertGPT(function(){
			self.ingestKeywords(self.keywords);
			self.stash.purge();
		});
	};

	__.augment(AdManager, __.PubSubPattern);

	AdManager.prototype.ingestKeywords = function ingestKeywords (keyword_list) {
		var self = this;

		// first, loop over all the keyword objects
		var counter = keyword_list.length;
		while (counter--) {
			var current_obj = keyword_list[counter];

			// second, check if these keywords apply to this page
			var valid_paths = current_obj.paths.split(',');
			if (!self.isValidPath(valid_paths)) {
				continue;
			};

			var keywords = current_obj.keywords.split(',');

			// make the keypair map of values
			var keypairs = {};
			var dirty_keypairs = current_obj.keyvalues.split(';');
			var dirty_keypairs_counter = dirty_keypairs.length;
			while (dirty_keypairs_counter--) {
				var pair = dirty_keypairs[dirty_keypairs_counter].split('=');
				var key = pair[0], value = pair[1];

				if (!keypairs.hasOwnProperty(key)) {
					keypairs[key] = [];
				};

				keypairs[key].push(value);
			};

			var positions = current_obj.positions.split(',');

			// the main keywords dataset is keyed by position name, so loop that next
			var positions_counter = positions.length;
			while (positions_counter--) {
				var current_position = positions[positions_counter];

				if (!self.keyword_map.hasOwnProperty(current_position)) {
					self.keyword_map[current_position] = {};
				};

				// for each position, populate the keywords
				var keywords_counter = keywords.length;
				while (keywords_counter--) {
					var current_keyword = keywords[keywords_counter];
					if (current_keyword) {
						// per GPT, single value keywords need to pass a string containing 'true'
						var obj = {};
						obj[keywords[keywords_counter]] = 'true';
						self.keyword_map[current_position].push(obj);
					};
				};

				// for each position, populate the key-value pairs
				_.each(keypairs, function(value, key){
					if (!self.keyword_map[current_position].hasOwnProperty(key)) {
						self.keyword_map[current_position][key] = [];
					};

					self.keyword_map[current_position][key].push(value);
				});
			};
		};

		// special debug query params

		if (__.queryParams['dfpKeyval']) {
			var dfp_keyvals = __.queryParams['dfpKeyval'].split(',');

			var dfp_keyvals_counter = dfp_keyvals.length;
			while (dfp_keyvals_counter--) {
				var pair = dfp_keyvals[dfp_keyvals_counter].split(':');
				var key = pair[0], value = pair[1];

				__.definePath(self, 'keyword_map.all.' + key, []);
				self.keyword_map.all[key].push(value);
			};
		};

		if (__.queryParams['dfpKeyword']) {
			var dfp_keyword = __.queryParams['dfpKeyword'];
			__.definePath(self, 'keyword_map.all.' + dfp_keyword, []);
			self.keyword_map.all[dfp_keyword].push('true');
		};

		// apply 'all' position to the page, so all slot inherit
		if (self.keyword_map.hasOwnProperty('all')) {
			_.each(self.keyword_map.all, function(keyword_values, keyword_key){
				googletag.pubads().setTargeting(keyword_key, keyword_values);
			});
		};

	};

	AdManager.prototype.isValidPath = function isValidPath (paths, location_override) {
		var self = this;

		var loc = location_override || (window.location.pathname + window.location.search + window.location.hash);

		var counter = paths.length;
		while (counter--) {
			var pathstr = paths[counter];

			if (pathstr === loc) {
				return true;

			// user lead the path with a forward slash => check on root
			} else if (pathstr.charAt(0) === '/' && loc.indexOf(pathstr) === 0) {
				return true;

			// then, if it exists in the location anywhere
			} else if (loc.indexOf(pathstr) !== -1) {
				return true;
			};
		};

		return false;
	};

	AdManager.prototype.processElement = function processElement (element) {
		var self = this;

		var $element = $(element);
		var settings = {
			sizes: $element.data('sizes'),
			position: $element.data('position'),
			tile: $element.data('tile'),
			'out-of-page': $element.data('out-of-page') || false,
			element: element
		};

		if ($element.data('zone')) {
			settings['zone'] = $element.data('zone');
		};

		self.createAd(settings);
	};

	AdManager.prototype.populate = function populate (selector) {
		var self = this;

		$(selector).each(function(){
			self.processElement(this);
		});
	};

	AdManager.prototype.autoPopulate = function () {
		var self = this;

		self.populate(IS_MOBILE ? '.ad_mobile' : '.ad_desktop');
	};

	AdManager.prototype.createAd = function createAd (params) {
		var self = this;

		self.stash.push(function(){
			var settings = _.defaults(params, { zone: self.zone });
			var new_ad = new Ad(settings);

			self.ad_list.push(new_ad);
			self.ads_by_id[new_ad.id] = new_ad;
			self.fire('create_ad', new_ad);
			new_ad.display(self.network_code, self.site_code, self.keyword_map[settings.position] || {});
		});
	};

	AdManager.prototype.refresh = function refresh (id) {
		var self = this;

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
