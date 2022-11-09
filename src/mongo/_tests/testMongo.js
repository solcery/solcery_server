const { ObjectId } = require('mongodb');
const virtualDb = {
	dbs: {
		testDb: {
			items: [
				{
					_id: ObjectId(),
					fields: {
						test: 1,
					}
				}
			],
			objects: [],
		}
	}
};

async function test(testEnv) {
	// Init
	const core = createCore({ 
		id: 'core',
		virtualDb,
	});
	let mongo = core.createMongo('testDb', [ 'items' ]);
	let item = await mongo.items.findOne({});
	assert(item.fields.test === 1)
}

module.exports = { test }
