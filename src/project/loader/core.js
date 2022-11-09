const Master = {}

Master.onCreate = function(data) {
  	if (!data.solceryDb) {
  		this.disableMixinCallbacks(Master);
  		return;
  	}
  	this.solceryDb = this.createMongo(data.solceryDb, [ 'objects' ]);
  	this.createProjects();
}

Master.createProjects = async function() {
  	let projects = await this.solceryDb.objects.find({ template: 'projects' }).toArray();
  	for (let project of projects) {
		let projectConfig = project.fields;
		env.log('Creating project with config ', projectConfig)
		this.create(Project, { 
			id: projectConfig.name,
			...projectConfig,
		})
	}
}

Master.onMongoReady = async function(mongo) {
	// if (mongo.id !== 'solcery') return;
	// let projects = await mongo.objects.find({ template: 'projects' }).toArray();
	// for (let project of projects) {
	// 	let projectConfig = project.fields;
	// 	this.create(Project, { 
	// 		id: `project.${projectConfig.name}`,
	// 		...projectConfig,
	// 	})
	// }
}

module.exports = Master;
