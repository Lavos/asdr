(function(){
	var LUCID = this;
	var prehash = {};
	var posthash = {};

	function store (point, singleton, depends) {
		if (posthash.hasOwnProperty(point)) {
			return;
		};

		var counter = 0, limit = depends.length, args = [];
		while (counter < limit) {
			if (!posthash.hasOwnProperty(depends[counter])) {
				store(depends[counter], prehash[depends[counter]].singleton, prehash[depends[counter]].depends);
			};

			args.push(posthash[depends[counter]]);
			counter++;
		};

		posthash[point] = singleton.apply(LUCID, args);
	};

	LUCID.provide = function provide (point, depends, singleton) {
		prehash[point] = {
			singleton: singleton,
			depends: depends
		};
	};

	LUCID.use = function use (depends, singleton) {
		var counter = 0, limit = depends.length, args = [];
		while (counter < limit) {
			if (!posthash.hasOwnProperty(depends[counter])) {
				store(depends[counter], prehash[depends[counter]].singleton, prehash[depends[counter]].depends);
			};

			args.push(posthash[depends[counter]]);
			counter++;
		};

		singleton.apply(LUCID, args);
	};

	LUCID.prehash = prehash;
	LUCID.posthash = posthash;

}).call(this['LUCID'] = this['LUCID'] || {});
