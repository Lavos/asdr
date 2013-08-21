CLARITY.provide('videotoaster', ['jquery', 'underscore', 'doubleunderscore'], function($, _, __){
	var defaults = {
		src: '',
		height: 224,
		width: 400,
		padding: 30,
		brandingImg: '',
		brandingClick: '',
		brandinglocation: [-10, 0],
		tracking: '',
		extraCSS: ''
	};
	var config = {};
	//return functions
	return {
		init: function(params){
			config = {};
			_.defaults(config, params, defaults);

			// kill any currently existing videotoasters
			this.kill();

			//variables
			var cachebreak = +new Date();
			var vtID = 'bmVideoToaster' + cachebreak,
				vtCSS = 'width='+ config.width +'px; height='+config.height+'px; position:fixed; bottom:-'+(config.height+config.padding)+'px; right:15%; border:1px solid #b0b0b0; z-index:100;' + config.extraCSS;
			if( config.src.indexOf('youtu') >= 0 ) {
				var player, srcID = config.src.split('/');
				function playerAppend(){
					$videotoaster = $('<div class="videotoaster" style="'+vtCSS+'"><iframe class="youtube-player" id="'+vtID+'" type="text/html" src="http://www.youtube.com/embed/'+srcID[3]+'?wmode=opaque&autohide=1&autoplay=1&enablejsapi=1&playerapiid='+vtID+'" frameborder="0" style="display:block">&lt;br /&gt;</iframe><i class="icon-remove-sign videotoaster_remove" style="position:absolute;top:3px;right:3px;cursor:pointer;color:#ff0000;z-index:101"></i><a href="'+config.brandingClick+'" target="_blank"><img src="'+config.brandingImg+'" border="0" style="position:absolute;top:'+config.brandinglocation[0]+'px;left:'+config.brandinglocation[1]+'px;z-index:101" /></a><img src="'+config.tracking+cachebreak+'" style="display:none"/></div>');
					$('body').append($videotoaster);
				}
				if (typeof YT !== 'object') {
					__.addJS('http://www.youtube.com/player_api');
						var old_onYouTubePlayerAPIReady = (typeof window.onYouTubePlayerAPIReady == 'function' ? window.onYouTubePlayerAPIReady : function(){});
      					window.onYouTubePlayerAPIReady = function onYouTubePlayerAPIReady() {
       						player = new YT.Player( vtID, {
        					playerVars: { 'autoplay': 1, 'controls': 1,'autohide':1,'wmode':'opaque' },
    							videoId: srcID[3] ,
    							events: { 'onReady': onPlayerReady }
    						});
    					old_onYouTubePlayerAPIReady();	
    				}
    				playerAppend();
				} else {
					playerAppend();
					player = new YT.Player( vtID, {
        				playerVars: { 'autoplay': 1, 'controls': 1,'autohide':1,'wmode':'opaque' },
    						videoId: srcID[3] ,
    						events: { 'onReady': onPlayerReady }
    				});
				} 
				function onPlayerReady(event) {
					event.target.mute();
    			}
			} else {
				$videotoaster = $('<div class="videotoaster" style="'+vtCSS+'"><iframe id="'+vtID+'" src="'+config.src+'" scrolling="no" frameborder="0" tabindex="0" allowtransparency="true" width="'+config.width+'" height="'+config.height+'" style="display:block"></iframe><i class="icon-remove-sign videotoaster_remove" style="position:absolute;top:3px;right:3px;cursor:pointer;color:#ff0000;z-index:101"></i><a href="'+config.brandingClick+'" target="_blank"><img src="'+config.brandingImg+'" border="0" style="position:absolute;top:'+config.brandinglocation[0]+'px;left:'+config.brandinglocation[1]+'px;z-index:101" /></a><img src="'+config.tracking+cachebreak+'" style="display:none"/></div>');
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
