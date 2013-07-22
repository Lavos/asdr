CLARITY.provide('facebook', ['doubleunderscore', 'module_helper'], function(__, module_helper){
	var Facebook = function Facebook () {
		var self = this;

		self.initialized = false;
		self.appID = null;
		self.permissions = null;
		self.user = {};

		self.init_stash = new __.Stash();
		self.load_stash = new __.Stash();
		/* self.element = document.createElement('div');
		self.element.id = 'fb-root';
		document.getElementsByTagname('body')[0].appendChild(self.element); */

		__.addJS('//connect.facebook.net/en_US/all.js', function(){
			self.jsapi = window.FB;
			self.fire('ready');
			self.load_stash.purge();
			console.log('loaded');
		});
	};

	__.augment(Facebook, __.PubSubPattern);

	Facebook.prototype.global_name = 'twitter';

	Facebook.prototype.init = function init (appID, permissions) {
		var self = this;

		self.appID = appID;
		self.permissions = permissions;

		self.load_stash.push(function(){
			self.jsapi.init({
				appId:  self.appID,
				status: true,
				cookie: true,
				xfbml:  true,
				oauth:  true
			});

			self.jsapi.getLoginStatus(function(response){
				console.log(response);

				self.initialized = true;
				self.user.loginStatus = response.status;

				if (self.user.loginStatus === 'connected') {
					// the user is logged in and connected to your
					// app, and response.authResponse supplies
					// the user's ID, a valid access token, a signed
					// request, and the time the access token
					// and signed request each expire
					self.user.uid = response.authResponse.userID;
					self.user.accessToken = response.authResponse.accessToken;

					// Get the user's permission
					self.jsapi.api('/me/permissions', function(data){
						console.log(data);

						self.user.permissions = data.data[0];
						self.init_stash.purge();
					});
				} else {
					self.init_stash.purge();
				}
			});
		});
	};

	Facebook.prototype.permissionRequest = function permissionRequest (permission, callback) {
		var self = this;

		var callback = callback || function(){};

		self.init_stash.push(function(){
			var needPermission = false;

			// Check if the user already has the requested permissions
			var permissionList = permission.replace(/\s/g, '').split(',');
			var counter = permissionList.length;

			while (counter--) {
				if (!__.hasPath(self, 'user.permissions.' + permissionList[counter])) {
					needPermission = true;
					break;
				};
			};

			if (needPermission) {
				//
				// 1. ask for permission
				// 2. reset user.permissions
				// 3. execute callback function
				//
				self.jsapi.login(function(response){
					self.get('/me/permissions', function(data){
						if (typeof data.data == 'object') {
							self.user.permissions = data.data[0];
							callback(response);
						} else {
							callback(data.error);
						}
					});
				}, { scope: permission });
			} else {
				self.jsapi.login(function(response){
					callback(response);
				});
			};
		});
	};

	Facebook.prototype.push = function push (work_obj) {
		var self = this;

		var func = work_obj.run || function(){};
		var uses = work_obj.use || [];

		self.init_stash.push(func, uses, self);
	};


	// convenience functions

	Facebook.prototype.logout = function logout (callback) {
		var self = this;

		self.push({
			use: [callback],
			run: function(callback) {
				this.jsapi.logout(callback);
			}
		});
	};

	Facebook.prototype.login = function login (callback) {
		var self = this;

		self.permissionRequest(self.permissions, callback);
	};

	Facebook.prototype.getPermissions = function getPermissions (callback) {
		var self = this;

		self.push({
			use: [callback],
			run: function(callback){
				callback(this.user.permissions);
			}
		});
	};

	Facebook.prototype.getUser = function getUser (callback) {
		var self = this;

		self.push({
			use: [callback],
			run: function(callback){
				callback(this.user);
			}
		});
	},

	Facebook.prototype.get = function get (path, callback) {
		var self = this;

		self.push({
			use: [path, callback],
			run: function(path, callback){
				this.jsapi.api(path, callback);
			}
		});
	};

	Facebook.prototype.post = function(path, data, callback) {
		var self = this;

		self.push({
			use: [path, data, callback],
			run: function(path, data, callback){
				this.jsapi.api(path, 'post', data, callback);
			}
		});
	};

	return new Facebook();
});
