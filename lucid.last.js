(function(LUCID){
	var counter = 0, limit = LUCID.list.length;
	while (counter < limit) {
		LUCID.push(LUCID.list[counter]);
		counter++;
	};
})(window['LUCID']);
