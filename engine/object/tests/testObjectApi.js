const { ObjectId } = require('mongodb');

const virtualDb = {
	objects: [
		{
			_id: ObjectId('00000041a3bc45846b9e9c5b'),
			template: 'testTemplate',
			fields: {
				name: 'testObject',
				number: 16,
			}
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
		return new Promise((resolve, reject) => {
			let response = {
				header: () => {},
				json: res => {
					if (res.status) {
						resolve(res.data);
					} else {
						reject(res.data);
					}
				}
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

	const engine = core.get(Engine, 'test')
	assert(engine)

	const api = core.get(Api, 'api');
	assert(api);


	// console.log(core.get(Engine, 'test'))

	// let content = await apiCall({
	// 	gameId: 'test',
	// 	command: 'engine.getContent',
	// 	templates: true,
	// 	objects: true
	// });

	let newObjId = await apiCall({
		command: 'engine.object.clone',
		gameId: 'test',
		objectId: '00000041a3bc45846b9e9c5b',
	})

	assert(newObjId);

	await apiCall({
		command: 'engine.object.update',
		gameId: 'test',
		objectId: newObjId,
		fields: {
			name: 'new Object',
			number: null,
		}
	})

	await apiCall({
		command: 'engine.object.delete',
		gameId: 'test',
		objectId: '00000041a3bc45846b9e9c5b',
	})
	
	assert(virtualDb.objects.length === 1);
	let newObj = virtualDb.objects[0];
	assert(newObj._id.toString() === newObjId);
	assert(!newObj.fields.number);
	assert(newObj.fields.name === 'new Object');
}

module.exports = { test }
