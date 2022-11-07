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

	const pubkey = 'some_pubkey'

	const core = createCore({ 
		id: 'core',
		httpServer: true,
	});
	core.create(Project, { 
		id: 'test',
		db,
		engine: true,
	});

	const engine = core.get(Project, 'test')
	assert(engine)

	const api = core.get(Api, 'api');
	api.listCommands({ public: true });
	assert(api);
	const apiCall = testEnv.createClientApi(api);

	let objectId = db.objects[0]._id.toString();

	// cloning object
	let newObjId = await apiCall({
		command: 'engine.template.object.clone',
		templateCode: 'testTemplate',
		projectId: 'test',
		pubkey,
		objectId,
	})

	assert(newObjId);

	await apiCall({
		command: 'engine.template.object.update',
		projectId: 'test',
		templateCode: 'testTemplate',
		objectId: newObjId,
		pubkey,
		fields: {
			name: 'new Object',
			number: null,
		}
	})

	await apiCall({
		command: 'engine.template.object.delete',
		templateCode: 'testTemplate',
		projectId: 'test',
		objectId,
		pubkey,
	})
	
	assert(db.objects.length === 1);
	let newObj = db.objects[0];
	assert(newObj._id.toString() === newObjId);
	assert(!newObj.fields.number);
	assert(newObj.fields.name === 'new Object');

	newObjId = await apiCall({
		command: 'engine.template.createObject',
		templateCode: 'testTemplate',
		projectId: 'test',
		pubkey,
	})

	assert(db.objects.length === 2);
	newObj = db.objects[1];
	assert(newObj._id.toString() === newObjId);
	assert(!newObj.fields.number);
	assert(!newObj.fields.name);

}

module.exports = { test }
