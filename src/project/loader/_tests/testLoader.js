const { ObjectId } = require('mongodb');

const virtualDb = {
	dbs: {
		solcery: {
				objects: [
				{
					_id: ObjectId(),
					template: 'projects',
					fields: {
						name: 'prj1',
						db: 'project1db',
						pvpServer: {},
					}
				},
				{
					_id: ObjectId(),
					template: 'projects',
					fields: {
						name: 'prj2',
						db: 'project2db',
						engine: {},
					}
				}

			],
		},
		project1db: {
			gameInfo: [
				{
					gameBuildVersion: 1
				}
			],
			gameBuilds: [
				{
					version: 1,
					content: {}
				}
			]
		},
		project2db: {
			objects: [],
			templates: []
		}
	}
}

async function test(testEnv) {
	// Init
	const core = createCore({ 
		id: 'core',
		solceryDb: 'solcery',
		virtualDb,
	});
	await sleep(1)
	let projects = core.getAll(Project)
	let pvpProject = core.get(Project, `project.prj1`);
	let engineProject = core.get(Project, `project.prj2`);
	assert(pvpProject.pvpServer)
	assert(engineProject.engine)
	

}

module.exports = { test }
