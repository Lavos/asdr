(function(){
	var LUCID = this;
	
	LUCID.provide = function provide (point, singleton) {
		LUCID[point] = singleton.call(LUCID);
	};
}).call(this['LUCID'] = this['LUCID'] || {});
