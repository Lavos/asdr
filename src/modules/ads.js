provide('ads', ['jquery', 'underscore', 'doubleunderscore'], function($, _, __){
	var WINDOW_WIDTH = __.dims().x;
	var IS_MOBILE = WINDOW_WIDTH < 728;
	var NETWORK_CODE = 4700;
	var BLOCK_ADS = false;

	var blocked_ips = [
		'173.244.180.106',
		'173.244.180.114',
		'173.244.180.122',
		'173.244.180.138',
		'173.244.180.146',
		'173.244.180.162',
		'173.244.180.34',
		'173.244.180.42',
		'173.244.180.58',
		'173.244.180.66',
		'173.244.180.82',
		'173.244.186.18',
		'173.244.186.34',
		'173.45.123.226',
		'173.45.64.34',
		'209.190.12.130',
		'64.79.68.178'
	];

	if (typeof window.remote_ip_address !== 'undefined') {
		var user_ips = window.remote_ip_address.split(/[\s,]+/);
		BLOCK_ADS = __.hasIntersection(user_ips, blocked_ips);
	};

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

	function getASISegments () {
		var segments = [], seg_string = __.cookies.get('rsi_segs');

		if (seg_string && seg_string.length) {
			segments = seg_string.split('|');
		};

		return segments.slice(0, 20);
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
			id: null,
			'out-of-page': false,
			targeting: {}
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

	Ad.prototype.display = function display (site_code, keywords_map) {
		var self = this;

		googletag.cmd.push(function(){
			var code_path = __.sprintf('/%s/%s/%s', NETWORK_CODE, site_code, self.options.zone);

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

			_.each(self.options.targeting, function(value, key, dict){
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
		self.keywords = [];
		self.keyword_map = {}; // collection of extensions keywords

		self.config_stash = null;
		self.stash = new __.Stash();
		self.ad_list = [];
		self.ads_by_id = {};

		if (!BLOCK_ADS) {
			insertGPT(function(){
				self._ingestKeywords(self.keywords);

				// adding Audience Science cookie values
				var asi_segments = getASISegments();

				if (asi_segments.length) {
					self.addPageTargeting('asi', asi_segments);
				};

				self.stash.purge();
			});
		};
	};

	__.augment(AdManager, __.PubSubPattern);

	AdManager.prototype.useLazyConfiguration = function useLazyConfiguration () {
		var self = this;

		if (!self.config_stash) {
			self.config_stash = new __.Stash();
		};
	};

	AdManager.prototype.configure = function configure (params) {
		var self = this;

		self.stash.push(function(){
			self.site_code = params.site_code || '';
			self.zone = params.zone || '';
			self.keywords = params.keywords || [];
			self._ingestKeywords(self.keywords);
			self.config_stash.purge();
		});
	};

	AdManager.prototype._ingestKeywords = function _ingestKeywords (keyword_list) {
		var self = this;

		if (__.getClass(keyword_list) !== 'array') {
			return;
		};

		// first, loop over all the keyword objects
		var counter = keyword_list.length;
		while (counter--) {
			var current_obj = keyword_list[counter];

			// second, check if these keywords apply to this page
			var valid_paths = current_obj.paths.split(',');
			if (!self._isValidPath(valid_paths)) {
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
						self.keyword_map[current_position][current_keyword] = 'true';
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

	AdManager.prototype._isValidPath = function _isValidPath (paths, location_override) {
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
			targeting: $element.data('targeting'),
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

	AdManager.prototype.autoPopulate = function autoPopulate () {
		var self = this;

		self.populate(IS_MOBILE ? '.ad_mobile' : '.ad_desktop');
	};

	AdManager.prototype.addPageTargeting = function addPageTargeting (key, value) {
		var self = this;

		function action () {
			googletag.pubads().setTargeting(key, value);
		};

		if (self.config_stash) {
			self.config_stash.push(action);
		} else {
			self.stash.push(action);
		};
	};

	AdManager.prototype.createAd = function createAd (params) {
		var self = this;

		var new_ad = new Ad(params);

		self.ad_list.push(new_ad);
		self.ads_by_id[new_ad.id] = new_ad;
		self.fire('create_ad', new_ad);

		function action () {
			new_ad.options.zone = self.zone;
			new_ad.display(self.site_code, self.keyword_map[params.position] || {});
		};

		if (self.config_stash) {
			self.config_stash.push(action);
		} else {
			self.stash.push(action);
		};

		return new_ad;
	};

	AdManager.prototype.refresh = function refresh (id) {
		var self = this;

		function action () {
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

		if (self.config_stash) {
			self.config_stash.push(action);
		} else {
			self.stash.push(action);
		};
	};

	return new AdManager();
});
