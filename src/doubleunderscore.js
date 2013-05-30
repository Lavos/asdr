/*
 *       doubleunderscore
 *       https://github.com/Lavos/doubleunderscore
 *
 *       Kris Cost, me@kriscost.com
 *
 *       Licensed under Creative Commons: Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0)
 *       http://creativecommons.org/licenses/by-sa/3.0/
 *
 *       Adapted code licensed by their respective authors.
 */

LUCID.provide('doubleunderscore', [], function(){
	return (function(root, factory){
		if (typeof root['define'] === 'function' && define.amd) {
			define(function(){ return factory(); });
		} else {
			return factory();
		};
	})(window, function(external){

	// {{{ Core Functionality

		var start_time = new Date();

		var __ = function __ (){};

		var previousDoubleUnderscore = this.__;
		__.version = 20130528;

		__.each = function (obj, iterator) {
			for (key in obj) {
				if (obj.hasOwnProperty(key)) {
					iterator(obj[key], key, obj);
				};
			};
		};

		__.extend = function (obj) {
			var objects = Array.prototype.slice.call(arguments, 1);
			var counter = 0, limit = objects.length;

			while (counter < limit) {
				var current = objects[counter];

				for (var prop in current) {
					obj[prop] = current[prop];
				};

				counter++;
			};

			return obj;
		};

		__.noConflict = function(){
			this.__ = previousDoubleUnderscore;
			return this;
		};


	// }}} close Core Functionality
	// {{{ Third-party Functions

		// adapted from: https://github.com/samsonjs/strftime - Copyright 2010 - 2011 Sami Samhuri <sami.samhuri@gmail.com>, MIT License
		// usage: __.strftime(format_string, [instance of Date], [run-time locale object], [use UTC boolean]);
		__.strftime = (function() {
			function words(s) { return (s || '').split(' '); };

			var DefaultLocale = {
				days: words('Sunday Monday Tuesday Wednesday Thursday Friday Saturday'),
				shortDays: words('Sun Mon Tue Wed Thu Fri Sat'),
				months: words('January February March April May June July August September October November December'),
				shortMonths: words('Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'),
				AM: 'AM',
				PM: 'PM'
			};

			function pad(n, padding) {
				padding = padding || '0';
				return n < 10 ? (padding + n) : n;
			};

			function hours12(d) {
				var hour = d.getHours();
				if (hour == 0) hour = 12;
				else if (hour > 12) hour -= 12;
				return hour;
			};

			function strftime(fmt, d, locale, useUTC) {
				return _strftime(fmt, d, locale, (useUTC || false));
			};

			function getLocalizedStrftime(locale) {
				return function(fmt, d) {
					return strftime(fmt, d, locale);
				};
			};

			// locale is an object with the same structure as DefaultLocale
			function _strftime(fmt, d, locale, _useUTC) {
				// d and locale are optional so check if d is really the locale
				if (d && !(d instanceof Date)) {
					locale = d;
					d = undefined;
				};

				d = d || new Date();
				locale = locale || DefaultLocale;
				locale.formats = locale.formats || {};

				if (_useUTC) {
					d = new Date(d.getTime() + ((d.getTimezoneOffset() || 0) * 60000));
				};

				// Most of the specifiers supported by C's strftime
				return fmt.replace(/%(.)/g, function(_, c) {
					switch (c) {
						case 'A': return locale.days[d.getDay()];
						case 'a': return locale.shortDays[d.getDay()];
						case 'B': return locale.months[d.getMonth()];
						case 'b': // fall through
						case 'h': return locale.shortMonths[d.getMonth()];
						case 'D': return strftime(locale.formats.D || '%m/%d/%y', d, locale);
						case 'd': return pad(d.getDate());
						case 'e': return d.getDate();
						case 'F': return strftime(locale.formats.F || '%Y-%m-%d', d, locale);
						case 'H': return pad(d.getHours());
						case 'I': return pad(hours12(d));
						case 'k': return pad(d.getHours(), ' ');
						case 'l': return pad(hours12(d), ' ');
						case 'M': return pad(d.getMinutes());
						case 'm': return pad(d.getMonth() + 1);
						case 'n': return '\n';
						case 'p': return d.getHours() < 12 ? locale.AM : locale.PM;
						case 'R': return strftime(locale.formats.R || '%H:%M', d, locale);
						case 'r': return strftime(locale.formats.r || '%I:%M:%S %p', d, locale);
						case 'S': return pad(d.getSeconds());
						case 's': return d.getTime();
						case 'T': return strftime(locale.formats.T || '%H:%M:%S', d, locale);
						case 't': return '\t';
						case 'u':
							var day = d.getDay();
							return day == 0 ? 7 : day; // 1 - 7, Monday is first day of the week
						case 'v': return strftime(locale.formats.v || '%e-%b-%Y', d, locale);
						case 'w': return d.getDay(); // 0 - 6, Sunday is first day of the week
						case 'Y': return d.getFullYear();
						case 'y':
							var y = String(d.getFullYear());
							return y.slice(y.length - 2);
						case 'Z':
							if (_useUTC) {
								return "GMT";
							}
							else {
								var tz = d.toString().match(/\((\w+)\)/);
								return tz && tz[1] || '';
							}
						case 'z':
							if (_useUTC) {
								return "+0000";
							}
							else {
								var off = d.getTimezoneOffset();
								return (off < 0 ? '-' : '+') + pad(off / 60) + pad(off % 60);
							}
						default: return c;
					};
				});
			};

			return strftime;
		})();

		/**
		sprintf() for JavaScript 0.7-beta1
		http://www.diveintojavascript.com/projects/javascript-sprintf

		Copyright (c) Alexandru Marasteanu <alexaholic [at) gmail (dot] com>
		All rights reserved.

		Redistribution and use in source and binary forms, with or without
		modification, are permitted provided that the following conditions are met:
		    * Redistributions of source code must retain the above copyright
		      notice, this list of conditions and the following disclaimer.
		    * Redistributions in binary form must reproduce the above copyright
		      notice, this list of conditions and the following disclaimer in the
		      documentation and/or other materials provided with the distribution.
		    * Neither the name of sprintf() for JavaScript nor the
		      names of its contributors may be used to endorse or promote products
		      derived from this software without specific prior written permission.

		THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
		ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
		WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
		DISCLAIMED. IN NO EVENT SHALL Alexandru Marasteanu BE LIABLE FOR ANY
		DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
		(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
		LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
		ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
		(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
		SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

		**/

		__.sprintf = (function() {
			function get_type(variable) {
				return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
			}
			function str_repeat(input, multiplier) {
				for (var output = []; multiplier > 0; output[--multiplier] = input) {/* do nothing */}
				return output.join('');
			}

			var str_format = function() {
				if (!str_format.cache.hasOwnProperty(arguments[0])) {
					str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
				}
				return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
			};

			str_format.format = function(parse_tree, argv) {
				var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
				for (i = 0; i < tree_length; i++) {
					node_type = get_type(parse_tree[i]);
					if (node_type === 'string') {
						output.push(parse_tree[i]);
					}
					else if (node_type === 'array') {
						match = parse_tree[i]; // convenience purposes only
						if (match[2]) { // keyword argument
							arg = argv[cursor];
							for (k = 0; k < match[2].length; k++) {
								if (!arg.hasOwnProperty(match[2][k])) {
									throw(sprintf('[sprintf] property "%s" does not exist', match[2][k]));
								}
								arg = arg[match[2][k]];
							}
						}
						else if (match[1]) { // positional argument (explicit)
							arg = argv[match[1]];
						}
						else { // positional argument (implicit)
							arg = argv[cursor++];
						}

						if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
							throw(sprintf('[sprintf] expecting number but found %s', get_type(arg)));
						}
						switch (match[8]) {
							case 'b': arg = arg.toString(2); break;
							case 'c': arg = String.fromCharCode(arg); break;
							case 'd': arg = parseInt(arg, 10); break;
							case 'e': arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential(); break;
							case 'f': arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg); break;
							case 'o': arg = arg.toString(8); break;
							case 's': arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg); break;
							case 'u': arg = Math.abs(arg); break;
							case 'x': arg = arg.toString(16); break;
							case 'X': arg = arg.toString(16).toUpperCase(); break;
						}
						arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+'+ arg : arg);
						pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
						pad_length = match[6] - String(arg).length;
						pad = match[6] ? str_repeat(pad_character, pad_length) : '';
						output.push(match[5] ? arg + pad : pad + arg);
					}
				}
				return output.join('');
			};

			str_format.cache = {};

			str_format.parse = function(fmt) {
				var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
				while (_fmt) {
					if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
						parse_tree.push(match[0]);
					}
					else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
						parse_tree.push('%');
					}
					else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
						if (match[2]) {
							arg_names |= 1;
							var field_list = [], replacement_field = match[2], field_match = [];
							if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
								field_list.push(field_match[1]);
								while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
									if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
										field_list.push(field_match[1]);
									}
									else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
										field_list.push(field_match[1]);
									}
									else {
										throw('[sprintf] huh?');
									}
								}
							}
							else {
								throw('[sprintf] huh?');
							}
							match[2] = field_list;
						}
						else {
							arg_names |= 2;
						}
						if (arg_names === 3) {
							throw('[sprintf] mixing positional and named placeholders is not (yet) supported');
						}
						parse_tree.push(match);
					}
					else {
						throw('[sprintf] huh?');
					}
					_fmt = _fmt.substring(match[0].length);
				}
				return parse_tree;
			};

			return str_format;
		})();

		__.vsprintf = function(fmt, argv) {
			argv.unshift(fmt);
			return __.sprintf.apply(null, argv);
		};


		/*!
		* Cookies.js - 0.2.1
		* Thursday, October 18 2012 @ 8:18 PM EST
		*
		* Copyright (c) 2012, Scott Hamper
		* Licensed under the MIT license,
		* http://www.opensource.org/licenses/MIT
		*/

		// modified to work in this context

		__.cookies = (function (document, undefined) {
			'use strict';

			var Cookies = function (key, value, options) {
				return arguments.length === 1 ? Cookies.get(key) : Cookies.set(key, value, options);
			};

			Cookies.get = function (key) {
				if (document.cookie !== Cookies._cacheString) {
					Cookies._populateCache();
				}

				return Cookies._cache[key];
			};

			Cookies.defaults = {
				path: '/'
			};

			Cookies.set = function (key, value, options) {
				var options = {
					path: options && options.path || Cookies.defaults.path,
					domain: options && options.domain || Cookies.defaults.domain,
					expires: options && options.expires || Cookies.defaults.expires,
					secure: options && options.secure !== undefined ? options.secure : Cookies.defaults.secure
				};

				if (value === undefined) {
					options.expires = -1;
				}

				switch (typeof options.expires) {
					// If a number is passed in, make it work like 'max-age'
					case 'number': options.expires = new Date(new Date().getTime() + options.expires * 1000); break;
					// Allow multiple string formats for dates
					case 'string': options.expires = new Date(options.expires); break;
				}

				// Escape only the characters that should be escaped as defined by RFC6265
				var cookieString = encodeURIComponent(key) + '=' + (value + '').replace(/[^!#-+\--:<-\[\]-~]/g, encodeURIComponent);
				cookieString += options.path ? ';path=' + options.path : '';
				cookieString += options.domain ? ';domain=' + options.domain : '';
				cookieString += options.expires ? ';expires=' + options.expires.toGMTString() : '';
				cookieString += options.secure ? ';secure' : '';

				document.cookie = cookieString;

				return Cookies;
			};

			Cookies.expire = function (key, options) {
				return Cookies.set(key, undefined, options);
			};

			Cookies._populateCache = function () {
				Cookies._cache = {};
				Cookies._cacheString = document.cookie;

				var cookiesArray = Cookies._cacheString.split('; ');
				for (var i = 0; i < cookiesArray.length; i++) {
					// The cookie value can contain a '=', so cannot use 'split'
					var separatorIndex = cookiesArray[i].indexOf('=');
					var key = decodeURIComponent(cookiesArray[i].substr(0, separatorIndex));
					var value = decodeURIComponent(cookiesArray[i].substr(separatorIndex + 1));

					// The first instance of a key in the document.cookie string
					// is the most locally scoped cookie with the specified key.
					// The value of this key will be sent to the web server, so we'll
					// just ignore any other instances of the key.
					if (Cookies._cache[key] === undefined) {
						Cookies._cache[key] = value;
					}
				}
			};

			Cookies.enabled = (function () {
				var isEnabled = Cookies.set('cookies.js', '1').get('cookies.js') === '1';
				Cookies.expire('cookies.js');
				return isEnabled;
			})();

			return Cookies;
		})(document);

	// }}} close Third-Party Functions
	// {{{ Utility Functions

		__.getRandomInt = function getRandomInt (min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		};

		__.getRandomItem = function getRandomItem (array) {
			return array[__.getRandomInt(0, array.length-1)];
		};

		__.check = function check (value) {
			return !(value === null || value === void 0 || value === '' || value === [] || value === false);
		};

		__.parseFilename = (function(){
			var split_regex = /(.+)\.([^.]+)$/;

			return function (path) {
				var matches = split_regex.exec(path);

				return {
					name: matches[1] || '',
					extension: matches[2] || ''
				};
			};
		})();

		__.hrFilesize = function (bytes, round_digits) {
			if (typeof round_digits === 'undefined') {
				round_digits = 2;
			};

			if (bytes < 1024) {
				return __.sprintf('%s B', bytes);
			} else if (bytes < Math.pow(1024, 2)) {
				return __.sprintf('%s KB', (bytes / 1024).toFixed(round_digits));
			} else if (bytes < Math.pow(1024, 3)) {
				return __.sprintf('%s MB', (bytes / Math.pow(1024, 2)).toFixed(round_digits));
			} else {
				return __.sprintf('%s GB', (bytes / Math.pow(1024, 3)).toFixed(round_digits));
			};
		};

		// escape regular expression special characters when using a string as part of RegExp constructor
		__.escapeRegex = function(s) {
			return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
		};

		// adapted from: underscore.js; added compile-time template settings, try/catch, removed 'with' usage
		__.template = (function template () {
			var defaults = {
				evaluate: /\[!([\s\S]+?)!\]/g,
				interpolate: /\[!=([\s\S]+?)!\]/g,
				varname: 'dt'
			};

			var template = function template (str, templatesettings) {
				var c = {};
				__.extend(c, defaults, templatesettings);

				var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
				'__p.push(\'' +
				str.replace(/\\/g, '\\\\')
				.replace(/'/g, "\\'")
				.replace(c.interpolate, function(match, code) { return "'," + code.replace(/\\'/g, "'") + ",'"; })
				.replace(c.evaluate || null, function(match, code) { return "');" + code.replace(/\\'/g, "'").replace(/[\r\n\t]/g, ' ') + "__p.push('"; })
				.replace(/\r/g, '\\r')
				.replace(/\n/g, '\\n')
				.replace(/\t/g, '\\t')
				+ "');return __p.join('');";

				try {
					return new Function(c.varname, 'extra', tmpl);
				} catch (e) {
					throw e;
				};
			};

			return template;
		})();

		// based on underscore.string truncate
		__.truncate = function (str, length, parting){
			if (!str) {
				return '';
			};

			str = String(str);
			parting = parting || '&hellip;';
			length = ~~length;
			return str.length > length ? str.slice(0, length) + parting : str;
		};

		// time maths
		__.relativeDate = function relativeDate (base_date, values) {
			var new_date = new Date(base_date.getTime());

			__.each(values, function(value, key, dict){
				switch (key) {
				case 'years':
					new_date.setYear(base_date.getFullYear() + value);
				break;
				case 'months':
					new_date.setMonth(base_date.getMonth() + value);
				break;
				case 'days':
					new_date.setDate(base_date.getDate() + value);
				break;
				case 'hours':
					new_date.setHours(base_date.getHours() + value);
				break;
				case 'minutes':
					new_date.setMinutes(base_date.getMinutes() + value);
				break;
				case 'seconds':
					new_date.setSeconds(base_date.getSeconds() + value);
				break;
				case 'milliseconds':
					new_date.setMilliseconds(base_date.getMilliseconds() + value);
				break;
				};
			});

			return new_date;
		};

		// returns friendly time difference between 2 Dates
		__.timeDiff = function timeDiff (dateA, dateB) {
			var first_date = null;
			var second_date = null;

			if (dateB) {
				first_date = dateA;
				second_date = dateB;
			} else {
				first_date = new Date();
				second_date = dateA;
			};

			var diff_ms = first_date - second_date;
			var is_positive = (diff_ms > 0);
			diff_ms = Math.abs(diff_ms);

			var seconds_milliseconds = __.divmod(diff_ms, 1000, 'seconds', 'milliseconds');
			var minutes_seconds = __.divmod(seconds_milliseconds.seconds, 60, 'minutes', 'seconds');
			var hours_minutes = __.divmod(minutes_seconds.minutes, 60, 'hours', 'minutes');
			var days_hours = __.divmod(hours_minutes.hours, 24, 'days', 'hours');
			var years_days = __.divmod(days_hours.days, 365, 'years', 'days');

			var verbose = [], suffix = '', short_phrase = '', short_stop = false;

			if (years_days.years > 0) {
				var years_noun =  ' year' + (years_days.years > 1 ? 's' : '');
				short_phrase = verbose[verbose.length] = years_days.years + years_noun;
				short_stop = true;
			};

			if (years_days.days > 0) {
				var day_noun =  ' day' + (years_days.days > 1 ? 's' : '');
				verbose[verbose.length] = years_days.days + day_noun;

				if (!short_stop) {
					short_phrase = days_hours.hours + hour_noun;
					short_stop = true;
				};
			};

			if (days_hours.hours > 0) {
				var hour_noun = ' hour' + (days_hours.hours > 1 ? 's' : '');
				verbose[verbose.length] = days_hours.hours + hour_noun;

				if (!short_stop) {
					short_phrase = days_hours.hours + hour_noun;
					short_stop = true;
				};
			};

			if (hours_minutes.minutes > 0) {
				var minute_noun = ' minute' + (hours_minutes.minutes > 1 ? 's' : '');
				verbose[verbose.length] = hours_minutes.minutes + minute_noun;

				if (!short_stop) {
					short_phrase = hours_minutes.minutes + minute_noun;
					short_stop = true;
				};
			};

			if (minutes_seconds.seconds > 0) {
				var second_noun = ' second' + (minutes_seconds.seconds > 1 ? 's' : '');
				verbose[verbose.length] = minutes_seconds.seconds + second_noun;

				if (!short_stop) {
					short_phrase = minutes_seconds.seconds + second_noun;
					short_stop = true;
				};
			};

			if (seconds_milliseconds.milliseconds > 0) {
				var millisecond_noun = ' millisecond' + (seconds_milliseconds.milliseconds > 1 ? 's' : '');
				verbose[verbose.length] = seconds_milliseconds.milliseconds + millisecond_noun;

				if (!short_stop) {
					short_phrase = 'less than 1 second';
					short_stop = true;
				};
			};

			if (is_positive) {
				suffix = 'ago';
			} else {
				suffix = 'in the future';
			};

			verbose[verbose.length] = suffix;

			return {
				verbose: verbose.join(' '),
				concise: __.sprintf('%s %s', short_phrase, suffix),
				positive: is_positive,
				years: years_days.years,
				days: years_days.days,
				hours: days_hours.hours,
				minutes: hours_minutes.minutes,
				seconds: minutes_seconds.seconds,
				milliseconds: seconds_milliseconds.milliseconds
			};
		};

	// }}} close Utility Functions
	// {{{ DOM Functions

		__.getMeta = function getMeta (target_document) {
			var target_document = target_document || document;
			var heads = target_document.getElementsByTagName('head');

			if (heads) {
				var metas = heads[0].getElementsByTagName('meta');
			} else {
				return {};
			};

			var meta_hash = {}, counter = metas.length;
			while (counter--) {
				var current = metas[counter];
				if (current.getAttribute('content')) {
					var key = current.getAttribute('property') || current.getAttribute('name') || current.getAttribute('content');
					meta_hash[key] = current.getAttribute('content');
				};
			};

			return meta_hash;
		};

		// adapted from: http://stackoverflow.com/questions/901115/get-querystring-values-with-jquery/2880929#2880929
		__.queryParams = (function gatherQueryParams () {
			var working = {};

			var e,
			a = /\+/g,
			r = /([^&;=]+)=?([^&;]*)/g,
			d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
			q = window.location.search.substring(1);

			while (e = r.exec(q)) {
				working[d(e[1])] = d(e[2]);
			};

			return working;
		})();

		__.toQueryParams = function toQueryParams (obj) {
			var working = [];

			__.each(obj, function(value, key, dict){
				working[working.length] = __.sprintf('%s=%s', encodeURIComponent(key), encodeURIComponent(value));
			});

			return (working.length ? '?' + working.join('&') : '');
		};

		__.divmod = function diffmod (dividend, divisor, label1, label2) {
			label1 = label1 || 'quotient';
			label2 = label2 || 'remainder';

			var response = {};
			response[label1] = parseInt(dividend / divisor, 10);
			response[label2] = (dividend % divisor);

			return response;
		};

		// standardized browser window dimensions
		__.dims = function dims () {
			var w = window, d = document, e = d.documentElement, g = d.getElementsByTagName('body')[0];

			return {
				x: w.innerWidth || e.clientWidth || __.path(g, 'clientWidth', 0),
				y: w.innerHeight || e.clientHeight || __.path(g, 'clientHeight', 0)
			};
		};

		// add generic onLoad events for elements that have onload events
		__.onLoad = function (element, callback, timeout) {
			var done = false;

			if (__.getType(callback) === 'function') {
				function handler (override) {
					if (override || (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete'))) {
						done = true;

						callback(this);
						__.clearOnLoad(this);
					};
				};

				element.onload = element.onreadystatechange = handler;

				if (timeout) {
					element.timer = setTimeout(function(){
						handler(true);
					}, timeout);
				};
			};

			return element;
		};

		__.clearOnLoad = function (element) {
			element.onload = element.onreadystatechange = null;
			if (element.timer) {
				clearTimeout(element.timer);
				element.timer = null;
			};

			return element;
		};

		// adapted from: http://www.hunlock.com/blogs/Totally_Pwn_CSS_with_Javascript
		__.addCSS = function addCSS (cssfilename) {
			var cssNode = document.createElement('link');
			cssNode.type = 'text/css';
			cssNode.rel = 'stylesheet';
			cssNode.href = cssfilename;
			cssNode.media = 'all';
			document.getElementsByTagName('head')[0].appendChild(cssNode);
		};

		__.addStyle = function addStyle (rules) {
			if (rules && rules.length > 0) {
				var head = document.getElementsByTagName('head')[0];
				var style_element = document.createElement('style');
				style_element.type = 'text/css';

				if (style_element.styleSheet) {
					style_element.styleSheet.cssText = rules.join('\n');
				} else {
					style_element.appendChild(document.createTextNode(rules.join('\n')));
				};

				head.appendChild(style_element);
				return style_element;
			} else {
				return null;
			};
		};

		__.addJS = function addJS (url, callback) {
			var newScript = __.onLoad(document.createElement('script'), callback);
			newScript.type = 'text/javascript';
			newScript.async = true;
			newScript.src = url;
			var s = document.getElementsByTagName('script')[0];
			s.parentNode.insertBefore(newScript, s);
		};

		__.addImage = function (url, callback, tracking, timeout) {
			var newImage = __.onLoad(document.createElement('img'), callback, timeout);
			newImage.src = url;

			if (tracking) {
				newImage.style.display = 'none';
				document.getElementsByTagName('body')[0].appendChild(newImage);
			};

			return newImage;
		};

		// adapted from: http://ejohn.org/projects/flexible-javascript-events/
		__.addEvent = function addEvent (element, type, callback) {
			if (element.attachEvent) {
				element['e' + type + callback] = callback;
				element[type + callback] = function(){
					element['e' + type + callback](window.event);
				};

				element.attachEvent('on' + type, element[type + callback] );
			} else {
				element.addEventListener(type, callback, false);
			};
		};

		__.removeEvent = function removeEvent (element, type, callback) {
			if (element.detachEvent) {
				element.detachEvent('on' + type, element[type + callback]);
				element[type + callback] = null;
			} else {
				element.removeEventListener(type, callback, false);
			};
		};

		// userAction

		__.onUserAction = function (callback, timeout) {
			var timer = null;

			if (timeout) {
				timer = setTimeout(userActionFunction, timeout);
			};

			__.addEvent(document, 'mousemove', userActionFunction);

			function userActionFunction () {
				__.removeEvent(document, 'mousemove', userActionFunction);

				if (timer) {
					clearTimeout(timer);
					timer = null;
				};

				callback();
			};
		};

	// }}} close DOM Functions
	// {{{ Object Functions

		// converts arrays of 2-property objects into single object: [{ name: 'a', value: 1 }, { name: 'b', value: 2 }] => { a: 1, b: 2 }
		__.dict = function dict (array) {
			var counter = array.length, response = {};
			while (counter--) {
				var current = array[counter];
				response[current.name] = current.value;
			};

			return response;
		};

		// adapted from: Pro Javascript Design Patterns
		__.augment = function augment (receivingClass, givingClass, methods) {
			if (methods) {
				var counter = methods.length;
				while (counter--){
					receivingClass.prototype[methods[counter]] = givingClass.prototype[methods[counter]];
				};
			} else {
				for (var methodName in givingClass.prototype) {
					receivingClass.prototype[methodName] = givingClass.prototype[methodName];
				};
			};
		};

		// adapted from BackBone's Inherit
		__.inherits = (function(){
			var ctor = function(){};

			return function(parent, body) {
				var body = body || function(){};

				var child = function(){
					parent.apply(this, arguments);
					body.apply(this, arguments);
				};

				__.extend(child, parent);

				ctor.prototype = parent.prototype;
				child.prototype = new ctor();
				child.prototype.constructor = child;
				child.__super__ = parent.prototype;

				return child;
			};
		})();

		// enables decorators to have init functions
		__.decorate = function decorate (target_object, decorator) {
			if (!target_object._DecorationInits) {
				target_object._DecorationInits = [];

				target_object._applyDecorations = function () {
					var counter = 0, limit = this._DecorationInits.length;
					while (counter < limit) {
						this._DecorationInits[counter].call(this);
						counter++;
					};
				};
			};

			target_object._DecorationInits.push(decorator.init);
			for (var methodName in decorator.methods) {
				target_object[methodName] = decorator.methods[methodName];
			};

			return target_object;
		};

		// port of Kohana's Arr::path for JavaScript objects
		__.path = (function(){
			function dive (point, index, properties, default_value) {
				var prop_name = properties[index];

				try {
					if (typeof point[prop_name] !== 'undefined') {
						if (index === properties.length-1) {
							return point[prop_name];
						} else {
							return dive(point[prop_name], ++index, properties, default_value);
						};
					} else {
						return default_value;
					};
				} catch (e) {
					return default_value;
				};
			};

			return function(obj, pathstr, dv) {
				return dive(obj, 0, pathstr.split('.'), dv);
			};
		})();

		// define objects along a dot-delimited path
		// ie: var myObj = {}; __.definePath(myObj, 'a.b.c', 123); // makes myObj: { a: { b: { c: 123 } } }
		__.definePath = function (source, pathstr, destination_value) {
			var node = source,
			points = pathstr ? pathstr.split('.') : [],
			counter = 0,
			limit = points.length;

			while (counter < limit) {
				var part = points[counter];
				var nso = node[part];

				if (!nso) {
					nso = (destination_value && counter + 1 === limit) ? destination_value : {};
					node[part] = nso;
				};

				node = nso;
				counter++;
			};

			return node;
		};

		// adapted from: http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
		__.getType = __.getClass = (function(obj) {
			var class_regex = /\s([a-zA-Z]+)/;

			return function(obj){
				return ({}).toString.call(obj).match(class_regex)[1].toLowerCase();
			};
		})();

	// }}} close Object Functions
	// {{{ Constructors and Data Structures

		// Publish Subscribe Pattern, formerly SharedMethods
		// usage:
		// 	1) __.augment(MyNewConstructor, __.PubSubPattern);
		// 	2) MyNewConstructor.prototype = new __.PubSubPattern();
		// 	n) there's other ways...

		__.SharedMethods = __.PubSubPattern = function PubSubPattern (){};

		__.PubSubPattern.prototype.cancelSubscriptions = function cancelSubscriptions (eventname) {
			var self = this;

			if (eventname && __.path(self, 'subscriptions.' + eventname, false)) {
				self.subscriptions[eventname] = [];
			} else if (!eventname) {
				self.subscriptions = {};
			};
		};

		__.PubSubPattern.prototype.once = function once (eventname, callback) {
			var self = this;

			function wrappedHandler () {
				callback.apply(self, arguments);
				self.off([eventname, wrappedHandler]);
			};

			return self.on(eventname, wrappedHandler);
		};

		__.PubSubPattern.prototype.on = function on (eventname, callback, once) {
			var self = this;

			var events = eventname.split(' ');

			// It is recommended that your object have a subscriptions object for self-documentation, but the code will detect if you don't and add one.
			if (!self.hasOwnProperty('subscriptions')) {
				self.subscriptions = {};
			};

			if (once) {
				var once_handles = [], once_counter = 0, once_limit = events.length;
				while (once_counter < once_limit) {
					once_handles[once_handles.length] = self.once(events[once_counter], callback);
					once_counter++;
				};

				return (once_handles.length === 1 ? once_handles[0] : once_handles);
			};

			var event_handles = [], event_counter = 0, event_limit = events.length;
			while (event_counter < event_limit) {
				var current_event = events[event_counter];

				if (!self.subscriptions.hasOwnProperty(current_event)) {
					self.subscriptions[current_event] = [];
				};

				self.subscriptions[current_event][self.subscriptions[current_event].length] = callback;

				event_handles[event_handles.length] = [current_event, callback]; // handle
				event_counter++;
			};

			return (event_handles.length === 1 ? event_handles[0] : event_handles);
		};

		__.PubSubPattern.prototype.off = function off (handle) {
			var self = this;

			var eventname = handle[0], func = handle[1];

			if (self.subscriptions.hasOwnProperty(eventname)) {
				var callbacks = self.subscriptions[eventname];

				var counter = callbacks.length;
				while (counter--) {
					if (callbacks[counter] === func) {
						self.subscriptions[eventname].splice(counter, 1);
					};
				};
			};
		};

		__.PubSubPattern.prototype._doCallbacks = function _doCallbacks (callbacks, args) {
			var self = this;

			var safe_callbacks = callbacks.slice();
			var safe_args = args.slice();
			var counter = 0, limit = safe_callbacks.length;

			while (counter < limit) {
				safe_callbacks[counter].apply(self, safe_args.slice(1));
				counter++;
			};
		};

		__.PubSubPattern.prototype.fire = function fire () {
			var self = this;

			var args = Array.prototype.slice.call(arguments);

			if (!self.hasOwnProperty('subscriptions')) {
				self.subscriptions = {};
			};

			if (self.subscriptions.hasOwnProperty('debug')) {
				self._doCallbacks(self.subscriptions['debug'], ['debug'].concat(args));
			};

			if (self.subscriptions.hasOwnProperty('all')) {
				self._doCallbacks(self.subscriptions['all'], ['all'].concat(args));
			};

			if (self.subscriptions.hasOwnProperty(args[0])) {
				self._doCallbacks(self.subscriptions[args[0]], args);
			};

			if (self.global_name) {
				var globalargs = [self.global_name + '_' + args[0], self].concat(args.slice(1));
				__.globalevents.fire.apply(__.globalevents, globalargs);
			};
		};

		// global events

		__.globalevents = new __.PubSubPattern();


		// create Modular Namespaces
		// uses provide to extend additional functionality via plugins
		// Example usage, plugins can be processed in any order:
		// (function(){ this.provide('test.two', 'abc'); }).call(this['NameSpace'] = this['NameSpace'] || new __.ModularNamespace());
		// NameSpace.test.two === 'abc'; // true

		__.ModularNamespace = function ModularNamespace (){};

		__.ModularNamespace.prototype.provide = function (attachment_point_string, source) {
			var self = this;

			__.definePath(self, attachment_point_string, source);
		};


		// utility constructors

		__.SerialManager = function SerialManager (max, callback) {
			var self = this;

			self.max = max;
			self.counter = 0;
			self.callback = callback;
			self.data = {};

			if (self.max === 0) {
				self.execute();
			};
		};

		__.SerialManager.prototype.bump = function (label, data) {
			var self = this;

			if (typeof label !== 'undefined') {
				self.data[label] = data;
			};

			if (++self.counter >= self.max) {
				self.callback(self.data);
			};
		};

		__.SerialManager.prototype.execute = function (data) {
			var self = this;

			self.callback(data);
		};


		__.Queue = function Queue () {
			var self = this;

			self.subscriptions = {
				start: [],
				step: [],
				end: []
			};

			self.list = [];
			self.args = [];
			self.pos = 0;
			self.end_time = self.time_delta = self.start_time = null;
		};

		__.augment(__.Queue, __.PubSubPattern);

		__.Queue.prototype.add = function add () {
			var self = this;

			var args = Array.prototype.slice.call(arguments);
			self.list[self.list.length] = args[0];
			self.args[self.args.length] = args.slice(1);
		};

		__.Queue.prototype.step = function step () {
			var self = this;

			if (self.pos === 0) {
				self.start_time = new Date();
				self.fire('start');
			} else if (self.pos >= self.list.length) {
				self.end_time = new Date();
				self.time_delta = self.end_time - self.start_time;
				self.fire('end');
				return;
			};

			self.fire('step');
			self.pos++;
			self.list[self.pos-1].apply(self, self.args[self.pos-1]);
		};

		__.Poll = function Poll (interval_duration) {
			var self = this;

			self.active = false;
			self.timer = null;
			self.interval = null;
			self.counter = 0;
			self.interval_duration = interval_duration || 0;

			self.subscriptions = {
				start: [],
				loop: [],
				stop: []
			};
		};

		__.augment(__.Poll, __.PubSubPattern);

		__.Poll.prototype.start = function () {
			var self = this;

			if (!self.active) {
				self.active = true;
				self.fire('start');
				self.loop();
			};
		};

		__.Poll.prototype.stop = function () {
			var self = this;

			self.active = false;
			self.fire('stop');
		};

		__.Poll.prototype.loop = function (delay) {
			var self = this;

			if (self.timer) {
				clearTimeout(self.timer);
				self.timer = null;
			};

			if (self.active) {
				if (delay) {
					self.timer = setTimeout(function(){
						self.timer = null;
						self.counter++;
						self.fire('loop');
					}, delay);
				} else if (self.interval_duration > 0 && self.interval === null) {
					self.interval = setInterval(function(){
						if (self.active) {
							self.counter++;
							self.fire('loop');
						} else {
							clearInterval(self.interval);
							self.interval = null;
						};
					}, self.interval_duration);
				} else {
					self.counter++;
					self.fire('loop');
				};
			};
		};

		__.Animation = function Animation (params) {
			var self = this;

			var defaults = {
				start: null,
				stop: null,
				values: [[0, 0]], // [[0, 100], [25, 75, 'easeIn']]
				frames: 0,
				easing: 'linear',
				interval: 0,
				duration: 0,
				frames_second: 77
			};

			__.extend(self.options = {}, defaults, params);

			self.subscriptions = {
				start: [],
				complete: [],
				end: [],
				frame: []
			};

			if (self.options.frames && self.options.interval) {
				self.total_frames = self.options.frames;
				self.poll = new __.Poll(self.options.interval);
			} else {
				self.total_frames = Math.ceil(self.options.frames_second * self.options.duration / 1000)
				self.poll = new __.Poll(Math.ceil(1000 / self.options.frames_second));
			};

			if (__.getType(self.options.start) === 'number' && __.getType(self.options.stop) === 'number') {
				self.values = [[self.options.start, self.options.stop]];
			} else {
				self.values = self.options.values;
			};

			self.reset();

			self.poll.on('loop', function(){
				if (self.active && self.current_frame < self.total_frames) {
					self.current_frame++;

					self.fire.apply(self, ['frame'].concat(self.getFrameValues(self.values, self.current_frame)));

					if (self.current_frame === self.total_frames) {
						self.fire('complete');
					};
				} else {
					self.stop();
				};
			});
		};

		__.augment(__.Animation, __.PubSubPattern);

		__.Animation.prototype.easings = {
			'linear': function(time, total) { return Math.pow(time/total, 1); },
			'easeIn': function(time, total) { return Math.pow(time/total, 3); },
			'easeOut': function(time, total) { return 1 - Math.pow(1 - (time/total), 3); }
		};

		__.Animation.prototype.getFrameValues = function (values, frame) {
			var self = this;

			var counter = 0, limit = values.length, frame_values = [];
			while (counter < limit) {
				var current = values[counter];
				var easing = current[2] || self.options.easing;

				frame_values[frame_values.length] = current[0] + (current[1] - current[0]) * self.easings[easing](frame, self.total_frames);
				counter++;
			};

			return frame_values;
		};

		__.Animation.prototype.start = function () {
			var self = this;

			if (!self.active) {
				self.active = true;
				self.start_time = new Date();
				self.fire('start');

				// apply the "starting" position
				self.fire.apply(self, ['frame'].concat(self.getFrameValues(self.values, 0)));

				self.poll.start();
			};
		};

		__.Animation.prototype.stop = function() {
			var self = this;

			self.stop_time = new Date();
			self.run_time = self.stop_time - self.start_time;

			self.reset();
			self.fire('end');
		};

		__.Animation.prototype.reset = function() {
			var self = this;

			self.active = false;
			self.poll.stop();
			self.current_frame = 0;
		};


		// based on Memento by Monwara LLC / Branko Vukelic <branko@monwara.com>
		// https://github.com/Monwara/Memento
		// adapted to work in this context, use external cookie library
		__.storage = (function(){
			var HAS_LOCALSTORAGE = window.localStorage ? true : false;

			var EXPIRE = new Date();
			EXPIRE.setFullYear(EXPIRE.getFullYear() + 1); // in one year

			return {
				set: function (key, value) {
					if (!key || !value || key.indexOf(' ') > -1) {
						return false;
					};

					key = '_dus_' + key;

					try {
						value = JSON.stringify(value);
					} catch (strErr) {
						return false;
					};

					if (HAS_LOCALSTORAGE) {
						window.localStorage[key] = value;
						return true;
					} else {
						__.cookies.set(key, value, { expires: EXPIRE });
						return true;
					};
				},

				get: function (key, default_value) {
					if (!key) { return; };

					key = '_dus_' + key;

					if (HAS_LOCALSTORAGE) {
						try {
							return typeof window.localStorage[key] !== 'undefined' ? JSON.parse(window.localStorage[key]) : def;
						} catch (parseErr) {
							return default_value;
						};
					} else {
						var cookie = __.cookies.get(key);

						if (!cookie) {
							return default_value;
						};

						try {
							return JSON.parse(cookie);
						} catch (parseErr) {
							return default_value;
						};
					};
				},

				unset: function (key) {
					if (!key) { return; }

					key = '_dus_' + key;

					if (HAS_LOCALSTORAGE) {
						delete window.localStorage[key];
					} else {
						__.cookie.expire(key);
					}
				}
			};
		})();


		// limited-space localStorage/cookie-backed cache
		__.CacheManager  = function CacheManager () {
			var self = this;

			self.caches = {};
		};

		__.CacheManager.prototype.getCache = function getCache (name, limit) {
			var self = this;

			return self.caches[name] || (self.caches[name] = new __.Cache(name, limit));
		};

		__.caches = new __.CacheManager();

		__.Cache = function Cache (name, limit) {
			var self = this;

			self.name = name || 'cache';
			self.limit = (limit ? Math.min(limit, 50) : 50); // max 50 since we have to try fit into a cookie
			self.data = __.storage.get(self.name) || [];
		};

		__.Cache.prototype.bump = function bump (value) {
			var self = this;

			if (self.data.length === self.limit) {
				self.data.shift();
			};

			self.data[self.data.length] = value;
			__.storage.set(self.name, self.data);
		};

		__.Cache.prototype.clear = function clear (value) {
			var self = this;

			__.storage.set(self.name, self.data = []);
		};


		// delay callbacks until sometime in the future
		__.Stash = function Stash () {
			var self = this;

			self.callbacks = [];
			self.args = [];
			self.purged = false;
		};

		__.Stash.prototype.push = function push (callback, args) {
			var self = this;

			args = args || [];

			if (self.purged) {
				callback.apply(self, args);
			} else {
				self.callbacks.push(callback);
				self.args.push(args);
			};
		};

		__.Stash.prototype.purge = function purge () {
			var self = this;

			if (!self.purged) {
				self.purged = true;

				var counter = 0, limit = self.callbacks.length;
				while (counter < limit) {
					self.callbacks[counter].apply(self, self.args[counter]);
					counter++;
				};
			};
		};

	// }}} close Constuctors and Data Structures

		__.eval_time = new Date() - start_time;
		return __;
	});
});
// # vim:fdm=marker