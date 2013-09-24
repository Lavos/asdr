(function(root, factory, namespace){
	var CONSTRUCTOR = factory();

	if (root[namespace] instanceof CONSTRUCTOR === false) {
		var list = root[namespace];
		var LIBRARY = new CONSTRUCTOR();
		LIBRARY.list = list;
		root['provide'] = function(){
			LIBRARY.provide.apply(LIBRARY, arguments);
		};
		root[namespace] = LIBRARY;
	};
})(window, function(){
	var prehash = {}, posthash = {};

	var LIBRARY = function LIBRARY (){
		this.start_time = new Date();
	};

	LIBRARY.prototype.store = function store (point) {
		if (!prehash.hasOwnProperty(point)) {
			throw('[%%LIBRARY_NAME%%] Unknown reference identifier: ' + point);
		};

		if (posthash.hasOwnProperty(point)) {
			return;
		};

		posthash[point] = prehash[point].singleton.apply(this, this.process_dependencies(prehash[point].depends));
	};

	LIBRARY.prototype.process_dependencies = function process_dependencies (dependencies) {
		var counter = 0, limit = dependencies.length, args = [];
		while (counter < limit) {
			var current = dependencies[counter];
			this.store(current);
			args.push(posthash[current]);
			counter++;
		};

		return args;
	};

	LIBRARY.prototype.provide = function provide (point, depends, singleton) {
		if (!prehash.hasOwnProperty(point)) {
			prehash[point] = {
				singleton: singleton,
				depends: depends
			};
		};
	};

	LIBRARY.prototype.push = function push (work_obj) {
		work_obj['run'] = work_obj['run'] || function(){};
		work_obj['use'] = work_obj['use'] || [];

		work_obj['run'].apply(this, this.process_dependencies(work_obj['use']));
	};

	return LIBRARY;
}, '%%LIBRARY_NAME%%');
