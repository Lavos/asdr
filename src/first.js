(function(root, factory){
	var CONSTRUCTOR = factory();

	if (root['CLARITY'] instanceof CONSTRUCTOR === false) {
		var list = root['CLARITY'];
		root['CLARITY'] = new CONSTRUCTOR();
		root['CLARITY'].list = list;
	};
})(window, function(){
	var CLARITY = function CLARITY (){
		this.start_time = new Date();
		this.prehash = {};
		this.posthash = {};
	};

	CLARITY.prototype.store = function store (point) {
		if (!this.prehash.hasOwnProperty(point)) {
			throw('[CLARITY] Unknown reference identifier: ' + point);
		};

		if (this.posthash.hasOwnProperty(point)) {
			return;
		};

		this.posthash[point] = this.prehash[point].singleton.apply(this, this.process_dependencies(this.prehash[point].depends));
	};

	CLARITY.prototype.process_dependencies = function process_dependencies (dependencies) {
		var counter = 0, limit = dependencies.length, args = [];
		while (counter < limit) {
			var current = dependencies[counter];
			this.store(current);
			args.push(this.posthash[current]);
			counter++;
		};

		return args;
	};

	CLARITY.prototype.provide = function provide (point, depends, singleton) {
		this.prehash[point] = {
			singleton: singleton,
			depends: depends
		};
	};

	CLARITY.prototype.push = function push (work_obj) {
		work_obj['run'] = work_obj['run'] || function(){};
		work_obj['use'] = work_obj['use'] || [];

		work_obj['run'].apply(this, this.process_dependencies(work_obj['use']));
	};

	return CLARITY;
});
