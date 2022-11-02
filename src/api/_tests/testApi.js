async function test(testEnv) {

	const core = createCore({ id: 'core1', httpServer: true });
	let response = {
		header: () => {},
		json: res => result = res,
	}

	let api = core.get(Api, 'api');
	assert(api);
	let apiCall = testEnv.createClientApi(api);

	let result = await apiCall({
		command: 'help'
	})
	assert(result.help)
}

module.exports = { test }
