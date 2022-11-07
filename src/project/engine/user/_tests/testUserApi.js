const { ObjectId } = require('mongodb');

const db = {
	users: [
		{
			id: ObjectId(),
			pubkey: 'some_pubkey',
			fields: {
				name: 'User1',
			}
		}
	]
};

async function test(testEnv) {
	const core = createCore({ 
		id: 'core', 
		httpServer: true,
	});
	core.create(Project, { 
		id: 'test',
		db,
		engine: true
	});

	const api = core.get(Api, 'api');

	assert(api);
	const apiCall = testEnv.createClientApi(api);

	let user = await apiCall({
		command: 'engine.user.get',
		projectId: 'test',
		pubkey: 'some_pubkey'
	});
	assert(user);

	await apiCall({
		command: 'engine.user.update',
		projectId: 'test',
		pubkey: 'some_pubkey',
		fields: {
			name: 'New name',
			css: 'some CSS',
		}
	})

	user = await apiCall({
		command: 'engine.user.get',
		projectId: 'test',
		pubkey: 'some_pubkey'
	});
	assert(user.fields.css === 'some CSS');
	assert(user.fields.name === 'New name');

}

module.exports = { test }
