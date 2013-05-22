(function(root, factory){
	var LUCID_CONSTRUCTOR = factory();

	if (root['LUCID'] instanceof LUCID_CONSTRUCTOR === false) {
		var list = root['LUCID'];
		root['LUCID'] = new LUCID_CONSTRUCTOR();
		root['LUCID'].list = list;
	};
})(window, function(){
	var prehash = {}, posthash = {};

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

	var LUCID = function LUCID () { };

	LUCID.prototype.provide = function provide (point, depends, singleton) {
		console.log('provide ' + point);

		prehash[point] = {
			singleton: singleton,
			depends: depends
		};
	};

	LUCID.prototype.push = function push (work_obj) {
		work_obj['do'].apply(this, process_dependencies(work_obj['use']));
	};

	return LUCID;
});
