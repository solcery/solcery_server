async function test() {

	const core = createCore({ id: 'core1' });
	let result;
	let response = {
		header: () => {},
		// json: (res) => console.log(res)
		json: res => result = res,
	}

	let api = core.get(Api, 'api');
	assert(api);

	api.apiCall({
		command: 'help'
	}, response);
	await sleep(1);
	assert(result)
	assert(result.status)
	assert(result.data.commands.help)
}

module.exports = { test }
