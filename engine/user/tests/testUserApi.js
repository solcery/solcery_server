const { ObjectId } = require('mongodb');

const virtualSystemDb = {
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
	const core = createCore({ id: 'core' });
	core.create(Engine, { 
		id: 'test',
		virtualSystemDb,
		gameId: 'test',
	});

	const engine = core.get(Engine, 'test')
	assert(engine)

	const api = core.get(Api, 'api');

	assert(api);
	const apiCall = testEnv.createClientApi(api);

	let user = await apiCall({
		command: 'engine.user.get',
		gameId: 'test',
		pubkey: 'some_pubkey'
	});
	assert(user);

	await apiCall({
		command: 'engine.user.update',
		gameId: 'test',
		pubkey: 'some_pubkey',
		fields: {
			name: 'New name',
			css: 'some CSS',
		}
	})

	user = await apiCall({
		command: 'engine.user.get',
		gameId: 'test',
		pubkey: 'some_pubkey'
	});
	assert(user.fields.css === 'some CSS');
	assert(user.fields.name === 'New name');

}

module.exports = { test }
