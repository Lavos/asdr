//
// GPT Ad
//
// http://support.google.com/dfp_premium/bin/answer.py?hl=en&answer=1638622
//
// Mobile Ads - How do we decide when to call mobile vs desktop (browser width)
// Mobile Ads - How / where do we define the slots?
// On/Fire - Event listeners - Add these
// adSlot.setTargeting("tile", tile); // Please verify that this is being used.
// How do we pass in "options: cat=Fashion" categories? - setTargeting ?
// Companion Ads - I think this is already taken care of in DFP based off position
// Add ad after page is loaded - Ads.create
// Refresh the JetPack Ad?! - Someone just verify that this is working
// Remove reliance on jQuery - its all in defineAndConfigureAds
//
// Infinite Scroll - How do we add more ad units after the page is loaded?
//
//
//
CLARITY.provide('AdsX', ['jquery'], function($){
	// Configuration
	var networkCode = 4700;
	var zone; // homepage, photo, royals, etc
	var siteCode; // buz.celebuzz, buz.wwtdd

	var pubads; // A reference to the publisher ads service.
	var adsList = {};

	function loadJavaScript() {
		
		// I have a theory that the width isnt' always set properly
		// Symptom - On celebuzz we see mobile ads on the desktop
		// which leads me to believe that the width being returned might be wrong
		if ( window.innerWidth <= 0  ) {
			// total junk to have to use setTimeout
			// in short polling to see if we get a real width
			window.setTimeout(function(){
				loadJavaScript();
			}, 300);
			return;
		}

		var gads = document.createElement("script");
		gads.async = true;
		gads.type = "text/javascript";
		var useSSL = "https:" == document.location.protocol;
		var js_file = ( window.innerWidth < 728 ) ? "gpt_mobile.js" : "gpt.js";
		gads.src = (useSSL ? "https:" : "http:") + "//www.googletagservices.com/tag/js/" + js_file;
		var node = document.getElementsByTagName("script")[0];
		node.parentNode.insertBefore(gads, node);

		// run when gpt is loaded
		// add onreadystatechange
		gads.onload = function() {
			pubads = googletag.pubads();
			pubads.collapseEmptyDivs();
			pubads.enableAsyncRendering();
			pubads.enableSingleRequest();
			googletag.enableServices();

			Ads.defineAndConfigureAds();
		};
	}

	return {

		//
		//
		//
		initialize: function(config) {
			siteCode = config.siteCode;
			zone = config.zone;
			loadJavaScript();
		},

		//
		// is generateAdCall a good function name?
		//
		generateAdCall: function(divID, sizes, position, tile) {
			googletag.cmd.push(function() {
				var adSlot = googletag.defineSlot('/'+networkCode+'/'+siteCode+'/'+zone, sizes, divID);
				console.log(adSlot);
				adSlot.addService(pubads);
				adSlot.setTargeting("pos", position);
				adSlot.setTargeting("tile", tile); // Please verify that this is being used.
				googletag.display(divID); // requests for this ad

				// add this to the global list of ads
				adsList[divID] = adSlot;
				// fire("generateAdCall");
			});
		},

		//
		// Takes in an optional divID to refresh a particular Ad
		//
		refresh: function(targetID) {
			if ( typeof targetID === "undefined" ) {
				pubads.refresh();
			} else {
				googletag.pubads().refresh([adsList[targetID]]);
			}
			// fire("refresh");
		},

		//
		//
		//
		create: function(targetID, divID) {
			// Check if the target element exists, if not abandon ship
			var target = document.getElementById("targetID");
			if ( typeof target === "undefined" ) {
				return;
			}

			// Create the new element
			var div = document.createElement("div");

			Ads.generateAdCall();

			// create a div, give it an id if one isn't passed in
			// call generateAdCall
			// fire("create");
		},

		//
		// if library loaded run function else save function to be run later
		// <div class="ad" id="monkey" data-sizes="[[300,250],[300,600]]" data-zone="homepage" data-position="300a" data-tile="1"></div>
		//
		// How do I do mobile here? Should I have 2 function one for desktop and one for mobile?
		//
		defineAndConfigureAds: function () {
			$(".ad_desktop").each(function(index) {
				var $this = $(this);

				// Make sure this slot isn't already loaded.
				if ( typeof $this.data("loaded") === "undefined" ) {
					var id = this.id;

					if ( !id || 0 === id.length ) {
						id = this.id = ("ad_n" + index);
					};

					// do we want to put resonable defaults in here, or abort if malformed?
					var sizes = $this.data("sizes");
					var zone = $this.data("zone");
					var position = $this.data("position");
					var tile = $this.data("tile");

					$this.data("loaded", "true");
					Ads.generateAdCall(id, sizes, position, tile);
				}
			});
		},

		//
		// Skins / Intersitials
		//
		// http://support.google.com/dfp_premium/bin/answer.py?hl=en&answer=1650154&expand=googletag_details
		// http://support.google.com/dfp_premium/bin/answer.py?hl=en-GB&answer=1154352
		// http://support.google.com/dfp_sb/bin/answer.py?hl=en&answer=1649768
		// http://support.google.com/dfp_premium/bin/answer.py?hl=en&answer=181073
		//
		outOfPageSlot: function() {
			var out_of_page_slot = document.getElementById("out_of_page_slot");
			if ( typeof out_of_page_slot !== "undefined" ) {
				googletag.defineOutOfPageSlot('/'+networkCode+'/'+siteCode+'/'+zone, 'out_of_page_slot').addService(googletag.pubads());
				googletag.display('out_of_page_slot');
				// fire("outOfPageSlot"); // do I put this in the IF statement or outside of it ?
			}
		}

	};
});
