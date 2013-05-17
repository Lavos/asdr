(function(){
	var LUCID = this;
	var prehash = {};
	var posthash = {};

	function store (point) {
		if (!prehash.hasOwnProperty(point)) {
			throw 'This resource is not known to me: ' + point;
		};

		if (posthash.hasOwnProperty(point)) {
			return;
		};

		var dependancy = prehash[point];

		var counter = 0, limit = dependancy.depends.length, args = [];
		while (counter < limit) {
			store(dependancy.depends[counter]);
			args.push(posthash[dependancy.depends[counter]]);
			counter++;
		};

		posthash[point] = dependancy.singleton.apply(LUCID, args);
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
			store(depends[counter]);
			args.push(posthash[depends[counter]]);
			counter++;
		};

		singleton.apply(LUCID, args);
	};

	LUCID.prehash = prehash;
	LUCID.posthash = posthash;

}).call(this['LUCID'] = this['LUCID'] || {});
