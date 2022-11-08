const Master = {}

Master.onCreate = function(data) {
  	if (!data.loader) {
  		this.disableMixinCallbacks(Master);
  		return;
  	}
  	// this.mongo('solcery').collection('objects').find({ template: 'projects' });
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
