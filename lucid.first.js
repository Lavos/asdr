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

		posthash[point] = dependency.singleton.apply(LUCID, process_dependencies(prehash[point].depends));
	};

	function process_dependencies (dependencies) {
		var counter = 0, limit = dependencies.length, args = [];
		while (counter < limit) {
			var current = dependencies[counter];
			store(current);
			args.push(posthash[current]);
			counter++;
		};

		return args;
	};

	var LUCID = function LUCID (){
		this.start_time = new Date();
	};

	LUCID.prototype.provide = function provide (point, depends, singleton) {
		prehash[point] = {
			singleton: singleton,
			depends: depends
		};
	};

	LUCID.prototype.push = function push (work_obj) {
		work_obj['do'] = work_obj['do'] || function(){};
		work_obj['use'] = work_obj['use'] || [];

		work_obj['do'].apply(this, process_dependencies(work_obj['use']));i
	};

	return LUCID;
});
