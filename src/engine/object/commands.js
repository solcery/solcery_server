const { ObjectId } = require('mongodb');
const Master = { commands: {} }

Master.commands.get = async function(params, ctx) {
	return ctx.object
}

Master.commands.update = async function(params, ctx) {
	console.log('command.update');
	console.log(params)
	let query = { _id: ObjectId(params.objectId) };
	let update = {};
	for (let [ field, value ] of Object.entries(params.fields)) {
		if (value !== null) {
			objset(update, value, '$set', `fields.${field}`);
		} else {
			objset(update, null, '$unset', `fields.${field}`);
		}
	}
	let res = await this.content.objects.updateOne(query, update, { upsert: false });
	if (!res.modifiedCount) throw new Error(`Updating object '${params.objectId}' failed with MongoDB error`);
}

Master.commands.clone = async function(params, ctx) {
	let newObject = { ...ctx.object }
	let time = this.time();
	objset(newObject, time, 'fields', 'creationTime');
	delete newObject._id;
	let res = await this.content.objects.insertOne(newObject);
	if (!res.insertedId) throw new Error(`Cloning object '${params.objectId}' failed with MongoDB error`);
	return res.insertedId;

}

Master.commands.delete = async function(params, ctx) {
	let res = await this.content.objects.deleteOne({ _id: ObjectId(params.objectId)});
	if (!res.deletedCount) throw new Error(`Deleting object '${params.objectId}' failed with MongoDB error`)
}

Master.commands.createObject = async function(params, ctx) {
	let newObject = {
		template: params.templateCode,
		fields: {
			creationTime: this.time(),
		}
	}
	let res = await this.content.objects.insertOne(newObject);
	if (!res.insertedId) throw new Error(`Creating new object for template '${params.templateCode}' failed with MongoDB error`);
	return res.insertedId;
}

module.exports = Master;
