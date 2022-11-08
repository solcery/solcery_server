const { ObjectId } = require('mongodb');

const project1db = {
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
}

const project2db = {
	objects: [
	],
	templates: [
	]
}

const solceryDb = {
	objects: [
		{
			_id: ObjectId(),
			template: 'projects',
			fields: {
				name: 'prj1',
				db: project1db,
				pvpServer: {},
			}
		},
		{
			_id: ObjectId(),
			template: 'projects',
			fields: {
				name: 'prj2',
				db: project2db,
				engine: {},
			}
		}

	],
};

async function test(testEnv) {
	// Init
	const core = createCore({ 
		id: 'core',
		solceryDb,
		loader: true,
	});
	await sleep(1)
	let projects = core.getAll(Project)
	let pvpProject = core.get(Project, `project.prj1`);
	let engineProject = core.get(Project, `project.prj2`);
	assert(pvpProject.pvpServer)
	assert(engineProject.engine)
	

}

module.exports = { test }
