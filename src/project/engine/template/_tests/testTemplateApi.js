const { ObjectId } = require('mongodb');

const virtualDb = {
	dbs: {
		testDb: {
			objects: [
				{
					_id: ObjectId(),
					template: 'testTemplate',
					fields: {
						name: 'Object 1',
						number: 1,
					}
				},
				{
					_id: ObjectId(),
					template: 'testTemplate',
					fields: {
						name: 'Object 2',
						number: 2,
					}
				}
			],
			templates: [
				{
					_id: ObjectId(),
					code: 'testTemplate',
					name: 'Test template',
					revision: 17,
					fields: [
						{
							code: 'name',
							name: 'Name',
							type: 'SString'
						},
						{
							code: 'number',
							name: 'Number',
							type: 'SInt'
						},
					]
				}
			]
		}
	}
};

async function test(testEnv) {

	const projectId = 'test';
	const pubkey = 'some_pubkey';

	const core = createCore({
		id: 'core',
		httpServer: true,
		virtualDb,
	});
	core.create(Project, { 
		id: 'test',
		db: 'testDb',
		engine: true
	});
	const api = core.get(Api, 'api');
	api.listCommands({ public: true });
	assert(api);
	const apiCall = testEnv.createClientApi(api);

	let schema = await apiCall({
		command: 'engine.template.getSchema',
		projectId: 'test',
		templateCode: 'testTemplate',
		pubkey,
	})
	let revision = schema.revision
	assert(schema.fields[0].name === 'Name');
	schema.fields.push({
		code: 'newField',
		name: 'New field',
		type: 'SInt',
	})
	await apiCall({
		command: 'engine.template.setSchema',
		projectId: 'test',
		templateCode: 'testTemplate',
		schema,
		pubkey,
	})
	schema = await apiCall({
		command: 'engine.template.getSchema',
		projectId: 'test',
		templateCode: 'testTemplate',
		pubkey,
	})
	assert(schema.fields.length === 3);
	assert(schema.revision === revision + 1);

	let objects = await apiCall({
		command: 'engine.template.getObjects',
		projectId: 'test',
		templateCode: 'testTemplate',
		pubkey,
	})
	assert(objects && objects.length === 2);
	assert(objects[0].fields.name === 'Object 1' && objects[1].fields.name === 'Object 2');

	let newObjId = await apiCall({
		command: 'engine.template.createObject',
		projectId: 'test',
		templateCode: 'testTemplate',
		pubkey,
	})
	objects = await apiCall({
		command: 'engine.template.getObjects',
		projectId: 'test',
		templateCode: 'testTemplate',
		pubkey,
	})
	assert(objects && objects.length === 3);
	objects[0].fields.name = 'New Object 1';
	objects[0].fields.number = 19;
	objects[2].fields.name = 'Object 3';
	objects[2].fields.newField = 200;
	await apiCall({
		command: 'engine.template.updateObjects',
		projectId: 'test',
		templateCode: 'testTemplate',
		objects,
		pubkey,
	})
	objects = await apiCall({
		command: 'engine.template.getObjects',
		projectId: 'test',
		templateCode: 'testTemplate',
		pubkey,
	})
	assert(objects && objects.length === 3);
	assert(objects[0].fields.name === 'New Object 1' && objects[0].fields.number === 19);
	assert(objects[1].fields.name === 'Object 2' && objects[1].fields.number === 2);
	assert(objects[2].fields.name === 'Object 3' && objects[2].fields.newField === 200 && objects[2]._id.toString() === newObjId);
}

module.exports = { test }
