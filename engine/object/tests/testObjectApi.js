const { ObjectId } = require('mongodb');

const virtualDb = {
	objects: [
		{
			_id: ObjectId(),
			template: 'testTemplate',
			fields: {
				name: 'testObject',
				number: 16,
			}
		}
	],
	templates: [
		{
			_id: ObjectId(),
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
	api.listCommands({ public: true });
	assert(api);

	let objectId = virtualDb.objects[0]._id.toString();

	let newObjId = await apiCall({
		command: 'engine.template.object.clone',
		templateCode: 'testTemplate',
		gameId: 'test',
		objectId,
	})

	assert(newObjId);

	await apiCall({
		command: 'engine.template.object.update',
		gameId: 'test',
		templateCode: 'testTemplate',
		objectId: newObjId,
		fields: {
			name: 'new Object',
			number: null,
		}
	})

	await apiCall({
		command: 'engine.template.object.delete',
		templateCode: 'testTemplate',
		gameId: 'test',
		objectId,
	})
	
	assert(virtualDb.objects.length === 1);
	let newObj = virtualDb.objects[0];
	assert(newObj._id.toString() === newObjId);
	assert(!newObj.fields.number);
	assert(newObj.fields.name === 'new Object');

	newObjId = await apiCall({
		command: 'engine.template.object.new',
		templateCode: 'testTemplate',
		gameId: 'test',
	})

	assert(virtualDb.objects.length === 2);
	newObj = virtualDb.objects[1];
	assert(newObj._id.toString() === newObjId);
	assert(!newObj.fields.number);
	assert(!newObj.fields.name);

}

module.exports = { test }
