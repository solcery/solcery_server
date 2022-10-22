const { ObjectId } = require('mongodb');

const db = {
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

	let schema = await apiCall({
		command: 'engine.template.getSchema',
		gameId: 'test',
		templateCode: 'testTemplate',
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
		gameId: 'test',
		templateCode: 'testTemplate',
		schema,
	})
	schema = await apiCall({
		command: 'engine.template.getSchema',
		gameId: 'test',
		templateCode: 'testTemplate',
	})
	assert(schema.fields.length === 3);
	assert(schema.revision === revision + 1);

	let objects = await apiCall({
		command: 'engine.template.getObjects',
		gameId: 'test',
		templateCode: 'testTemplate',
	})
	assert(objects && objects.length === 2);
	assert(objects[0].fields.name === 'Object 1' && objects[1].fields.name === 'Object 2');

	let newObjId = await apiCall({
		command: 'engine.template.object.new',
		gameId: 'test',
		templateCode: 'testTemplate',
	})
	objects = await apiCall({
		command: 'engine.template.getObjects',
		gameId: 'test',
		templateCode: 'testTemplate',
	})
	assert(objects && objects.length === 3);
	objects[0].fields.name = 'New Object 1';
	objects[0].fields.number = 19;
	objects[2].fields.name = 'Object 3';
	objects[2].fields.newField = 200;
	await apiCall({
		command: 'engine.template.updateObjects',
		gameId: 'test',
		templateCode: 'testTemplate',
		objects,
	})
	objects = await apiCall({
		command: 'engine.template.getObjects',
		gameId: 'test',
		templateCode: 'testTemplate',
	})
	assert(objects && objects.length === 3);
	assert(objects[0].fields.name === 'New Object 1' && objects[0].fields.number === 19);
	assert(objects[1].fields.name === 'Object 2' && objects[1].fields.number === 2);
	assert(objects[2].fields.name === 'Object 3' && objects[2].fields.newField === 200 && objects[2]._id.toString() === newObjId);
}

module.exports = { test }
