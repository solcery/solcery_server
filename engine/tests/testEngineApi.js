const virtualDb = {
	objects: [
		{
			_id:  65,
			template: 'testTemplate',
			fields: []
		}
	],
	templates: [
		{
			_id: 6,
			code: 'testTemplate'
		}
	]
};

async function test() {

	const core = createCore({ id: 'core' });
	core.create(Engine, { 
		id: 'test',
		virtualDb,
		gameId: 'test',
	});

	let engine = core.get(Engine, 'test')
	assert(engine)
	// console.log(core.get(Engine, 'test'))


	let result;
	let response = {
		header: () => {},
		// json: (res) => console.log(res)
		json: res => {
			result = res
		},
	}

	let api = core.get(Api, 'api');
	assert(api);

	api.apiCall({
		command: 'engine.getContent',
		gameId: 'test',
		templates: true,
		objects: true,
	}, response);
	await sleep(1);
	assert(result)
	assert(result.status)
	assert(result.data.objects)
	assert(result.data.templates)

}

module.exports = { test }
