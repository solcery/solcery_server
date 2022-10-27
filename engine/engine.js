const { ObjectId } = require("mongodb");
const Master = {}

Master.onCreate = function(data) {
	this.content = this.create(Mongo, {
		id: 'content',
		db: data.gameId,
		virtualDb: data.virtualContentDb,
		collections: [
			'objects',
			'templates',
		]
	})
	this.system = this.create(Mongo, {
		id: 'system',
		db: data.gameId,
		virtualDb: data.virtualSystemDb,
		collections: [
			'users',
			'logs',
			'config'
		]
	})
}

Master.getConfig = async function(data) {
	if (!this.config) {
		this.config = await this.system.config.findOne({});
	}
	return this.config;
}

Master.updateConfig = async function(update) {
	await this.system.config.updateOne({}, update);
}

Master.exportContent = async function(data) {
	let result = {}
	if (data.objects) {
		result.objects = await this.content.objects.find({}).toArray();
	}
	if (data.templates) {
		result.templates = await this.content.templates.find({}).toArray();
	}
	return result;
}

Master.importContent = async function(data) {
	let { templates, objects } = data;
	if (templates) {
		templates.forEach(tpl => tpl._id = ObjectId(tpl._id));
		await this.content.templates.deleteMany({});
		await this.content.templates.insertMany(templates);
	}
	if (objects) {
		objects.forEach(obj => obj._id = ObjectId(obj._id));
		await this.content.objects.deleteMany({});
		await this.content.objects.insertMany(objects);
	}
}

module.exports = Master
