const { ObjectId } = require("mongodb");
const Master = {}

Master.onCreate = function(data) {
	if (!data.engine) {
		this.disableMixinCallbacks(Master);
		return;
	}
	this.contentDb = this.core.createMongo(data.db, [ 'objects', 'templates' ]);
	this.systemDb = this.core.createMongo(data.db, [ 'config', 'users' ]);
	this.engine = data.engine;
}

Master.getConfig = async function(data) {
	let config = await this.systemDb.config.findOne({});
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
	await this.systemDb.config.updateOne({}, update);
}

Master.exportContent = async function(data) {
	let result = {}
	if (data.objects) {
		result.objects = await this.contentDb.objects.find({}).toArray();
	}
	if (data.templates) {
		result.templates = await this.contentDb.templates.find({}).toArray();
	}
	return result;
}

Master.importContent = async function(data) {
	let { templates, objects } = data;
	if (templates) {
		templates.forEach(tpl => tpl._id = ObjectId(tpl._id));
		await this.contentDb.templates.deleteMany({});
		await this.contentDb.templates.insertMany(templates);
	}
	if (objects) {
		objects.forEach(obj => obj._id = ObjectId(obj._id));
		await this.contentDb.objects.deleteMany({});
		await this.contentDb.objects.insertMany(objects);
	}
}

module.exports = Master
