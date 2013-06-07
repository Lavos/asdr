(function(root, factory){
	var CONSTRUCTOR = factory();

	if (root['CLARITY'] instanceof CONSTRUCTOR === false) {
		var list = root['CLARITY'];
		root['CLARITY'] = new CONSTRUCTOR();
		root['CLARITY'].list = list;
	};
})(window, function(){
	var prehash = {}, posthash = {};

	function store (point) {
		if (!prehash.hasOwnProperty(point)) {
			throw('[CLARITY] Unknown reference identifier: ' + point);
		};

		if (posthash.hasOwnProperty(point)) {
			return;
		};

		posthash[point] = prehash[point].singleton.apply(CLARITY, process_dependencies(prehash[point].depends));
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

	var CLARITY = function CLARITY (){
		this.start_time = new Date();
	};

	CLARITY.prototype.provide = function provide (point, depends, singleton) {
		prehash[point] = {
			singleton: singleton,
			depends: depends
		};
	};

	CLARITY.prototype.push = function push (work_obj) {
		work_obj['run'] = work_obj['run'] || function(){};
		work_obj['use'] = work_obj['use'] || [];

		work_obj['run'].apply(this, process_dependencies(work_obj['use']));
	};

	return CLARITY;
});
