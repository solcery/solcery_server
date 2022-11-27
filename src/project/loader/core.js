const Master = {}

Master.onCreate = function(data) {
  	if (!data.solceryDb) {
  		this.disableMixinCallbacks(Master);
  		return;
  	}
  	this.projectConfigs = data.projectConfigs; // TODO: remove
  	this.solceryDb = this.createMongo(data.solceryDb, [ 'objects' ]);
  	this.loadProjects();
}

Master.loadProject = async function(projectId) {
	let project = this.get(Project, projectId);
	if (project) {
		project.delete();
	}
	let projectConfig = await this.core.solceryDb.objects.findOne({ 
		template: 'projects', 
		'fields.name': projectId 
	});
	assert(projectConfig, `No config found for project ${projectId}`);
	env.log('Creating project with config ', projectConfig.fields)
	this.create(Project, { 
		id: projectConfig.fields.name,
		...projectConfig.fields,
	})
}

Master.loadProjects = async function() {
	for (let project of this.core.getAll(Project)) {
        project.delete();
    }
    let projectConfigs = this.projectConfigs ?? await this.solceryDb.objects.find({ template: 'projects' }).toArray();
  	for (let projectConfig of projectConfigs) {
  		env.log('Creating project with config ', projectConfig.fields)
		this.create(Project, { 
			id: projectConfig.fields.name,
			...projectConfig.fields,
		})
	}
}

module.exports = Master;
