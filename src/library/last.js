(function(CLARITY){
	CLARITY.end_time = new Date();
	CLARITY.eval_time = CLARITY.end_time - CLARITY.start_time;

	var counter = 0, limit = CLARITY.list.length;
	while (counter < limit) {
		CLARITY.push(CLARITY.list[counter]);
		counter++;
	};
})(window['CLARITY']);
