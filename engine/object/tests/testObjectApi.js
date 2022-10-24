const { ObjectId } = require('mongodb');

const db = {
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

async function test(testEnv) {
	const core = createCore({ id: 'core' });
	core.create(Engine, { 
		id: 'test',
		virtualContentDb: db,
		virtualSystemDb: true,
		gameId: 'test',
	});

	const engine = core.get(Engine, 'test')
	assert(engine)

	const api = core.get(Api, 'api');
	api.listCommands({ public: true });
	assert(api);
	const apiCall = testEnv.createClientApi(api);

	let objectId = db.objects[0]._id.toString();

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
	
	assert(db.objects.length === 1);
	let newObj = db.objects[0];
	assert(newObj._id.toString() === newObjId);
	assert(!newObj.fields.number);
	assert(newObj.fields.name === 'new Object');

	newObjId = await apiCall({
		command: 'engine.template.createObject',
		templateCode: 'testTemplate',
		gameId: 'test',
	})

	assert(db.objects.length === 2);
	newObj = db.objects[1];
	assert(newObj._id.toString() === newObjId);
	assert(!newObj.fields.number);
	assert(!newObj.fields.name);

}

module.exports = { test }
