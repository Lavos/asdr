(function(){
	var LUCID = this, prehash = {}, posthash = {};

	function store (point) {
		if (!prehash.hasOwnProperty(point)) {
			throw '[LUCID] Unknown reference identifier: ' + point;
		};

		if (posthash.hasOwnProperty(point)) {
			return;
		};

		var dependency = prehash[point];
		posthash[point] = dependency.singleton.apply(LUCID, process_dependencies(dependency.depends));
	};

	function process_dependencies (dependencies) {
		var args = [];

		var counter = 0, limit = dependencies.length, args = [];
		while (counter < limit) {
			store(dependencies[counter]);
			args.push(posthash[dependencies[counter]]);
			counter++;
		};

		return args;
	};

	LUCID.provide = function provide (point, depends, singleton) {
		prehash[point] = {
			singleton: singleton,
			depends: depends
		};
	};

	LUCID.use = function use (depends, singleton) {
		singleton.apply(LUCID, process_dependencies(depends));
	};

	LUCID.prehash = prehash;
	LUCID.posthash = posthash;

}).call(this['LUCID'] = this['LUCID'] || {});
