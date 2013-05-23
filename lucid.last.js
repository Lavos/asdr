(function(LUCID){
	var counter = 0, limit = LUCID.list.length;
	while (counter < limit) {
		LUCID.push(LUCID.list[counter]);
		counter++;
	};

	LUCID.end_time = new Date();
	LUCID.eval_time = LUCID.end_time - LUCID.start_time;
})(window['LUCID']);
