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

	const apiCall = (data) => {
		return new Promise(resolve => {
			let response = {
				header: () => {},
				json: res => resolve(res)
			}
			api.apiCall(data, response);
		})
	}

	const core = createCore({ id: 'core' });
	core.create(Engine, { 
		id: 'test',
		virtualDb,
		gameId: 'test',
	});

	let engine = core.get(Engine, 'test')
	assert(engine)
	// console.log(core.get(Engine, 'test'))

	const api = core.get(Api, 'api');
	assert(api);

	let result = await apiCall({
		command: 'engine.getContent',
		gameId: 'test',
		templates: true,
		objects: true,
	});
	assert(result)
	assert(result.status)
	assert(result.data.objects)
	assert(result.data.templates)

}

module.exports = { test }
