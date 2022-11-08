const signal = {
	core1: false,
	core2: false
}

// Mixin
const TestMixin = { 
	_name: 'testMixin' 
}

TestMixin.onCreate = function(data) {
	if (data.disableTestMixin) {
		this.disableMixinCallbacks(TestMixin)
	}
}

TestMixin.onTestCallback = function(data) {
	signal[this.id] = true;
}
//

const mixins = [
	{
		dweller: Core,
		mixinConfig: {
			master: TestMixin
		}
	}
]

function test() {
	const core1 = createCore({ 
		id: 'core1', 
		disableTestMixin: true, 
	});
	const core2 = createCore({ 
		id: 'core2', 
	});
	core1.execAllMixins('onTestCallback');
	core2.execAllMixins('onTestCallback');
	assert(!signal.core1)
	assert(signal.core2)
	
	core1.delete();
	core2.delete();
}

module.exports = { test, mixins }
