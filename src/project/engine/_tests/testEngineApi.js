const { ObjectId } = require('mongodb');
const projectDb1 = {
	config: [
		{
			_id: ObjectId(),
			fields: {
				sync: {
					sourceProjectId: 'project2',
					isLocked: true,
				}
			}
		}
	],
	objects: [
		{
			_id:  ObjectId(),
			template: 'oldTemplate',
			fields: {},
		}
	],
	templates: [
		{
			_id: ObjectId(),
			code: 'oldTemplate',
		}
	],
};

const projectDb2 = {
	objects: [
		{
			_id:  ObjectId(),
			template: 'newTemplate',
			fields: {
				number: 1,
			}
		},
		{
			_id:  ObjectId(),
			template: 'newTemplate',
			fields: {
				number: 2,
			}
		}
	],
	templates: [
		{
			_id: ObjectId(),
			code: 'newTemplate',
			fields: [
				{
					code: 'number',
					type: 'SInt'
				}
			]
		}
	],
};

async function test(testEnv) {
	// Init
	const core = createCore({ 
		id: 'core',
		httpServer: true,
	});
	core.create(Project, { 
		id: 'project1',
		db: projectDb1,
		gameId: 'project1',
		engine: true,
	});
	core.create(Project, { 
		id: 'project2',
		db: projectDb2,
		gameId: 'project2',
		engine: true,
	});

	const api = core.get(Api, 'api');
	api.listCommands({ public: true });
	assert(api);
	const apiCall = testEnv.createClientApi(api);




	// Shooting fisrt getContent
	let content = await apiCall({
		command: 'engine.getContent',
		projectId: 'project1',
		templates: true,
		objects: true,
	});
	assert(content.objects[0].template === 'oldTemplate');
	
	let failed = false;
	await apiCall({
		command: 'engine.sync',
		projectId: 'project1',
	}).catch(e => failed = true);
	assert(failed)

	let config = await apiCall({
		command: 'engine.getConfig',
		projectId: 'project1'
	});

	config.sync.isLocked = false;
	await apiCall({
		command: 'engine.setConfig',
		projectId: 'project1',
		pubkey: 'some',
		fields: config,
	});
	
	await apiCall({
		command: 'engine.sync',
		projectId: 'project1',
		pubkey: 'some',
	})
	content = await apiCall({
		command: 'engine.getContent',
		projectId: 'project1',
		templates: true,
		objects: true,
	});
	assert(content.objects.length === 2);
	assert(content.objects[0].template === 'newTemplate');

	content.objects[0]._id = content.objects[0]._id.toString();
	content.objects[0].fields.number = 16;

	content.objects[1]._id = content.objects[1]._id.toString();
	content.objects[1].fields.number = null;


	content.templates[0]._id = content.templates[0]._id.toString();
	content.templates[0].fields.push({
		code: 'secondField',
		type: 'SString'
	})
	let migrationPayload = {
		objects: [
			content.objects[0],
			content.objects[1],
		],
		newObjects: [
			{
				_id: ObjectId().toString(),
				template: 'newTemplate',
				fields: {
					number: 100,
				}
			}
		],
		templates: [
			content.templates[0],
		],
		newTemplates: [
			{
				_id: ObjectId().toString(),
				code: 'migrationTemplate',
				fields: []
			}
		],
	}

	await apiCall(Object.assign({
		command: 'engine.migrate',
		projectId: 'project1',
		pubkey: 'some',
	}, migrationPayload));

	content = await apiCall({
		command: 'engine.getContent',
		projectId: 'project1',
		pubkey: 'some',
		templates: true,
		objects: true,
	});

	assert(content.objects[0].fields.number === 16);
	assert(content.objects[1].fields.number === null);
	assert(content.objects[2].fields.number === 100);
	assert(content.templates[0].fields[1].code === 'secondField');
	assert(content.templates[1].code === 'migrationTemplate')

}

module.exports = { test }
