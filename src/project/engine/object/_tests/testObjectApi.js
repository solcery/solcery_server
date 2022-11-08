const { ObjectId } = require('mongodb');


const virtualDb = {
	dbs: {
		testDb: {
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
		}
	}
}

async function test(testEnv) {

	const projectDb = virtualDb.dbs.testDb;
	const pubkey = 'some_pubkey'

	const core = createCore({ 
		id: 'core',
		httpServer: true,
		virtualDb,
	});
	core.create(Project, { 
		id: 'test',
		db: 'testDb',
		engine: true,
	});

	const engine = core.get(Project, 'test')
	assert(engine)

	const api = core.get(Api, 'api');
	api.listCommands({ public: true });
	assert(api);
	const apiCall = testEnv.createClientApi(api);

	let objectId = projectDb.objects[0]._id.toString();

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
	
	assert(projectDb.objects.length === 1);
	let newObj = projectDb.objects[0];
	assert(newObj._id.toString() === newObjId);
	assert(!newObj.fields.number);
	assert(newObj.fields.name === 'new Object');

	newObjId = await apiCall({
		command: 'engine.template.createObject',
		templateCode: 'testTemplate',
		projectId: 'test',
		pubkey,
	})

	assert(projectDb.objects.length === 2);
	newObj = projectDb.objects[1];
	assert(newObj._id.toString() === newObjId);
	assert(!newObj.fields.number);
	assert(!newObj.fields.name);

}

module.exports = { test }
