//
//
//

(function(root, factory){
	var appID = null;
	var permissions = null;

	if (typeof root['Facebook'] === 'object') {
		appID = root['Facebook']['appID'];
		permissions = root['Facebook']['permissions'];
	};

	root['Facebook'] = factory(appID, permissions, root);
})(this, function(appID, permissions, root){
	var enabled = true;
	var initialized = false;
	var stash = [];

	var site = {
		appID: appID,
		permissions: permissions
	}

	var user = {
		uid: "",
		accessToken: "",
		loginStatus: "",
		permissions: ""
	}

	root.fbAsyncInit = function() {
		FB.init({
			appId:  site.appID,
			status: true, 
			cookie: true, 
			xfbml:  true,
			oauth:  true
		});

		FB.getLoginStatus(function(response) {
			initialized = true;
			user.loginStatus = response.status;

			if (user.loginStatus === 'connected') {
				// the user is logged in and connected to your
				// app, and response.authResponse supplies
				// the user's ID, a valid access token, a signed
				// request, and the time the access token 
				// and signed request each expire
				user.uid = response.authResponse.userID;
				user.accessToken = response.authResponse.accessToken;

				// Get the user's permission
				Facebook.get("/me/permissions", function(data){
					user.permissions = data.data[0];
					purgeStash();	
				});
			} else {
				if ( response.status === 'not_authorized' ) {
					// the user is logged in to Facebook, 
					// but not connected to the app
				} 
				
				purgeStash();	
			}
				
		});
	}

	function loadFacebook() {
		var newScript = document.createElement('script');
		newScript.type = 'text/javascript';
		newScript.async = true;
		newScript.src = '//connect.facebook.net/en_US/all.js';

		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(newScript, s);
	}

	function saveThis(funct) {
		if (initialized == true) { 
			funct();
		} else {
			stash.push(funct);
		}
	};

	function purgeStash () {
		var counter = 0, limit = stash.length;
		while (counter < limit) {
			stash[counter]();
		};
	};

	if (site.appID && site.permissions) {
		loadFacebook();
	};

	return {

		initialize: function(appID, permissions){
			site.appID = appID;
			site.permissions = permissions;
			loadFacebook();
		},

		get: function(path, callback) {
			saveThis(function(){
				FB.api(path, function(response) {
					if ( typeof callback == "function" ) {
						callback(response);
					}
				});
			});
		},

		// 
		// Note you will need the following Facebook permission
		//    publish_stream
		// 
		// Post to a user's wall
		// 
		// Facebook.post("/me/feed", {
		//    message: "Fort Minor"},
		// function(data){
		//    printd(data);
		// });
		// 
		// Publish to a user's stream
		// 
		// Facebook.post("/me/livestrongcom:eat", {
		//    food: "http://www.livestrong.com/thedailyplate/nutrition-calories/food/generic/banana/"},
		// function(data){
		//    printd(data);
		// });
		// 
		post: function(path, data, callback) {
			saveThis(function(){
				FB.api(path, "post", data, function(response) {
					if ( typeof callback == "function" ) {
						callback(response);
					}
				});
			});
		},

		getUser: function(callback) { 
			saveThis(function(){
				callback(user);
			});
		},

		login: function(callback) {
			Facebook.permissionRequest(site.permissions, callback);
		},

		//
		// Function: logout
		// http://developers.facebook.com/docs/reference/javascript/FB.logout
		//
		logout: function(callback) {
			saveThis(function(){
				FB.logout(function(){
					callback();
				});
			});
		},
		//
		// https://developers.facebook.com/docs/reference/api/permissions/
		// 
		// Facebook.permissionRequest("publish_actions", function(){
		//    Facebook.post("/me/livestrongcom:eat", {
		//        food: "http://www.livestrong.com/thedailyplate/nutrition-calories/food/generic/banana/"
		//    },function(data){
		//        printd(data);
		//    });
		// });
		// 
		permissionRequest: function(permission, callback) {
			saveThis(function(){
				var needPermission = false;

				// Check if the user already has the requested permissions
				var permissionList = permission.split(",");
				for ( var i=0, len=permissionList.length; i<len; i++ ) {
					var perm = permissionList[i].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
					if ( typeof user.permissions[perm] == "undefined" ) {
						needPermission = true;
						break;
					}
				}

				if ( needPermission == true ) {
					//
					// 1. ask for permission
					// 2. reset user.permissions
					// 3. execute callback function
					//
					FB.login(function(response){
						Facebook.get("/me/permissions", function(data){
							if ( typeof data.data == "object" ) {
								user.permissions = data.data[0];
								if ( typeof callback == "function" ) {
									callback(response);
								}
							} else {
								if ( typeof callback == "function" ) {
									callback(data.error);
								}
							}
						});  
					}, { scope: permission });
				} else {
					FB.login(function(response){
						if ( typeof callback == "function" ) {
							callback(response);
						}
					});
				}

			});
		},

		getPermissions: function(callback) {
			saveThis(function(){
				callback(user.permissions);
			});
		},
		
		commentCount: function(url, callback) {
			saveThis(function(){
				FB.api({
					method: 'fql.query',
					query: 'SELECT commentsbox_count FROM link_stat WHERE url="' + url +'"'
				}, function(response) {
					if(typeof callback === "function") {
						callback(response[0].commentsbox_count);
					}
				});
			});
		},
		
		commentStats: function(url, callback) {
			saveThis(function(){
				FB.api({
					method: 'fql.query',
					query: 'SELECT xid, object_id, post_id, fromid, time, text, id, username, reply_xid, post_fbid, app_id, likes, comments, user_likes, is_private FROM comment WHERE object_id IN (SELECT comments_fbid FROM link_stat WHERE url="' + url +'")'
				}, function(response) {
					if(typeof callback === "function") {
					//	printd(response);
						callback(response[0]);
					}
				});
			});
		},
		
		// Function: search
		// type: post, user, page, event, group
		//
		//
		// Example
		//	
		// Facebook.search("fitness", function(data){
		//    for(var i in data.data) {
		//       if( data.data[i].type != 'link' && data.data[i].type != 'status') {
		//          printd(data.data[i].type + ": " + data.data[i].from.name + ": " + data.data[i].message);
		//          printd(data.data[i]);
		//       }
		//    }
		// });
		// 
		search: function(term, callback, type) {
			saveThis(function() {
				var params = {};
				params.q = term;
				if(type != undefined) {
					params.type = type;
				}

				FB.api('/search', 'get', params, function(response) {
					if(typeof callback === "function") {
						callback(response);
					}
				});
			});
		},

		//
		// Function: Facebook.ui
		//
		// Documentation:
		//    http://developers.facebook.com/docs/reference/javascript/FB.ui/
		//    http://developers.facebook.com/docs/reference/dialogs/feed/
		//
		// Example:
		// Show the facebook share popup
		//   Facebook.ui({ 
		//     method: 'feed',
		//     name: badge.name +" Badge",
		//     link: "http://www.livestrong.com/prof/badges/{/literal}{$_user.username}{literal}",
		//     description:  "{/literal}{$_user.username}{literal} just achieved the "+ badge.name +" Badge: "+ badge.description.replace("!", "") + " on LIVESTRONG.COM",
		//     picture: "http://www.livestrong.com/media/images/badges/" +badge.image+ "_100x100.png"
		//   }, function(response){
		//     // alert(response);
		//   });
		//
		// Example: 
		// Show the Facebook permission dialog
		//   Facebook.ui({
		//     method: 'permissions.request',
		//     scope: 'user_photos'
		//   });
		//
		ui: function(data, callback) {
			saveThis(function(){
				FB.ui(data, callback);
			});
		},

		pageStats: function(url, callback) {
			saveThis(function(){

				var query = 'SELECT url, normalized_url, share_count, like_count, comment_count, total_count, commentsbox_count, comments_fbid FROM link_stat WHERE';
				if (typeof url === "string") {
					query += ' url="' + url + '"';
				} else if (typeof url === "object" && url.length > 1) {
					for(var i=0; i<url.length; i++) {
						query += ' url="' + url[i] + '"';
						if(i < url.length - 1) {
							query += ' OR';
						}
					}
				} else {
					return;
				}

				FB.api({
					method: 'fql.query',
					query: query
				}, function(response) {
					if(typeof callback === "function") {
						callback(response);
					}
				});

			});
		}


	}

});
