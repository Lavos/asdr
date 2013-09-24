(function(LIBRARY){
	LIBRARY.end_time = new Date();
	LIBRARY.eval_time = LIBRARY.end_time - LIBRARY.start_time;

	var counter = 0, limit = LIBRARY.list.length;
	while (counter < limit) {
		LIBRARY.push(LIBRARY.list[counter]);
		counter++;
	};
})(window['%%LIBRARY_NAME%%']);
