provide('module_helper', [], function(){
	return {
		workobj_push: function push (work_obj) {
			var self = this;

			var func = work_obj.run || function(){};
			var uses = work_obj.use || [];

			self.stash.push(func, uses, self);
		}
	};
});
