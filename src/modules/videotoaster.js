CLARITY.provide('videotoaster', ['jquery', 'underscore', 'doubleunderscore'], function($, _, __){
	var defaults = {
		type: 'youtube',
		src: '',
		height: 200,
		width: 300,
		padding: 30,
		brandingImg: '',
		brandingClick: '',
		brandinglocation: [-10, 0],
		tracking: '',
		extraCSS: ''
	};

	//return functions
	return {
		init: function(params){
			var config = {};
			_.defaults(config, params, defaults);

			// kill any currently existing videotoasters
			this.kill();

			//variables
			var cachebreak = +new Date();
			var vtID = 'bmVideoToaster' + cachebreak,
				vtCSS = 'width='+ config.width +'px; height='+config.height+'px; position:fixed; bottom:-'+(config.height+config.padding)+'px; right:15%; border:1px solid #b0b0b0; z-index:100;' + config.extraCSS;

			if(config.type == "youtube") {
				$videotoaster = $('<div class="videotoaster" style="'+vtCSS+'"><div id="'+vtID+'">You need Flash player 8+ and JavaScript enabled to view this video.</div><i class="icon-remove-sign videotoaster_remove" style="position:absolute;top:3px;right:3px;cursor:pointer;color:#ff0000;z-index:101"></i><a href="'+config.brandingClick+'" target="_blank"><img src="'+config.brandingImg+'" border="0" style="position:absolute;top:'+config.brandinglocation[0]+'px;left:'+config.brandinglocation[1]+'px;z-index:101" /></a><img src="'+config.tracking+cachebreak+'" style="display:none"/></div>');
				$('body').append($videotoaster);

				function processSWFObject () {
					var params = { allowScriptAccess: "always" };
					var atts = { id: vtID };
					srcID = config.src.split('/');
					swfobject.embedSWF("http://www.youtube.com/v/"+srcID[3]+"?enablejsapi=1&playerapiid="+vtID+"&version=3", vtID, config.width, config.height, "8", null, null, params, atts, function(e){
						//extra CSS to Object
						e.ref.style.display = 'block';
					});
				};

				//if swfobject not on page, add it and run it
				if (typeof swfobject !== 'object') {
					__.addJS('http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js', processSWFObject);
				} else {
					processSWFObject();
				}

				var old_onYouTubePlayerReady = (typeof window.onYouTubePlayerReady == 'function' ? window.onYouTubePlayerReady : function(){});

				window.onYouTubePlayerReady = function onYouTubePlayerReady(playerId) {
					if (typeof playerId !== 'undefined' && playerId.indexOf('bmVideoToaster' + cachebreak) >= 0) {
						ytplayer = document.getElementById(playerId);
						ytplayer.playVideo();
						ytplayer.mute();
					} else {
						old_onYouTubePlayerReady();
					}
				}
			} else if (config.type == 'iframe') {
				$videotoaster = $('<div class="videotoaster" style="'+vtCSS+'"><iframe id="'+vtID+'" src="'+config.src+'" scrolling="no" frameborder="0" tabindex="0" allowtransparency="true" width="'+config.width+'" height="'+config.height+'"></iframe><i class="icon-remove-sign videotoaster_remove" style="position:absolute;top:3px;right:3px;cursor:pointer;color:#ff0000;z-index:101"></i><a href="'+config.brandingClick+'" target="_blank"><img src="'+config.brandingImg+'" border="0" style="position:absolute;top:'+config.brandinglocation[0]+'px;left:'+config.brandinglocation[1]+'px;z-index:101" /></a><img src="'+config.tracking+cachebreak+'" style="display:none"/></div>');
					$('body').append($videotoaster);
			}
			//animate in
			$videotoaster.animate({bottom:'+='+(config.height+config.padding)+''},'slow');

			//exit button
			$videotoaster.on('click', '.videotoaster_remove', this.kill);
		},
		kill: function(){ //kill all toasters
			$('.videotoaster').each(function(){ $(this).animate({bottom:'-='+($(this).height()+config.padding)+''},'slow',function(){ this.remove(); }); });
		}
	};
});
