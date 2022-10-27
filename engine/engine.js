const { ObjectId } = require("mongodb");
const Master = {}

Master.onCreate = function(data) {
	this.content = this.create(Mongo, {
		id: 'content',
		db: data.db,
		collections: [
			'objects',
			'templates',
		]
	})
	this.system = this.create(Mongo, {
		id: 'system',
		db: data.db,
		collections: [
			'users',
			'logs',
			'config'
		]
	})
}

Master.getConfig = async function(data) {
	let config = await this.system.config.findOne({});
	return config.fields;
}

Master.updateConfig = async function(fields) {
	let update = {};
	for (let [ field, value ] of Object.entries(fields)) {
		if (value !== null) {
			objset(update, value, '$set', `fields.${field}`);
		} else {
			objset(update, null, '$unset', `fields.${field}`);
		}
	}
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
