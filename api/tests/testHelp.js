async function test() {
	const core = await createCore();
	// testContext.addMixin(Api, ApiMixin)
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
	await core.getRequest(request, response)
}

module.exports = { test }
