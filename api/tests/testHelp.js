async function test() {

	const core = createCore({ id: 'core1' });
	let request = {
		query: {
			command: 'help'
		}
	}
	let result;
	let response = {
		header: () => {},
		// json: (res) => console.log(res)
		json: res => result = res,
	}

	core.apiCall(request.query, response);
	await sleep(1);
	assert(result)
	assert(result.status)
	assert(result.data.commands.help)
}

module.exports = { test }
