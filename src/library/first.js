(function(root, factory, namespace){
	var CONSTRUCTOR = factory(namespace);

	if (root[namespace] instanceof CONSTRUCTOR === false) {
		var list = root[namespace];
		root[namespace] = new CONSTRUCTOR();
		root[namespace].list = list;
	};
})(window, function(namespace){
	var prehash = {}, posthash = {};
	var class_regex = /\s([a-zA-Z]+)/;

	var LIBRARY = function LIBRARY (){
		this.start_time = new Date();
	};

	LIBRARY.prototype.store = function store (point) {
		if (!prehash.hasOwnProperty(point)) {
			throw('[' + namespace + '] Unknown reference identifier: ' + point);
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

	LIBRARY.prototype.push = function push (variable) {
		var variable_class = ({}).toString.call(variable).match(class_regex)[1].toLowerCase();
		var work_obj = {};

		switch (variable_class) {

		default:
		case 'undefined': // didn't get anything
			return;
		break;

		case 'array': // quick
			var func_name = variable[0], passed_args = variable.slice(1);

			if (!func_name) return;

			work_obj['use'] = ['quick'];
			work_obj['run'] = function(quick){
				if (quick.hasOwnProperty(func_name)) {
					quick[func_name].apply(this, passed_args);
				};
			};
		break;

		case 'object': // assume a work object
			work_obj['run'] = variable['run'] || function(){};
			work_obj['use'] = variable['use'] || [];
		break;
		};

		work_obj['run'].apply(this, this.process_dependencies(work_obj['use']));
	};

	return LIBRARY;
}, '__LIBRARY_NAME__');
