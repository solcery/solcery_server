const ApiMixin = {
	onApiCommand: function(command, result, params) {
		//
	}
}

module.exports = async function() {
	// testContext.addMixin(Api, ApiMixin)
	const core = await createCore();
	assert(core.api, 'API handler was not created by core!');
	let request = {
		query: {
			command: 'help'
		}
	}
	let response = {
		header: () => {},
		json: (res) => {
			assert(res.status)
			assert(res.data.commands.help, 'Help command did not return itself in response!')
		}
	}
	await new Promise(r => setTimeout(r, 500));
	await core.api.getRequest(request, response)
	
}