LUCID.provide('mod1', ['$', 'zmod'], function(jQuery, zmod){
	console.log('this is mod1 and I am so happy');
	console.dir(this);
	console.dir(jQuery);
	console.dir(zmod);
	return 12345;
});
