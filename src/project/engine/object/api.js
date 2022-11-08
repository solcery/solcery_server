const { ObjectId } = require('mongodb');
const Master = { api: { engine: { template: { object: {} } } } };

Master.api.engine.template.object.ctx = async function(params, ctx) {
	ctx.object = await ctx.project.contentDb.objects.findOne({ 
		_id: ObjectId(params.objectId),
		template: ctx.template.code,
	})
	assert(ctx.object, `No object with id '${params.objectId}' found!`);
}

Master.api.engine.template.object.get = async function(params, ctx) {
	return ctx.object
}

Master.api.engine.template.object.update = async function(params, ctx) {
	let query = { _id: ObjectId(params.objectId) };
	let update = {};
	for (let [ field, value ] of Object.entries(params.fields)) {
		if (value !== null) {
			objset(update, value, '$set', `fields.${field}`);
		} else {
			objset(update, null, '$unset', `fields.${field}`);
		}
	}
	let res = await ctx.project.contentDb.objects.updateOne(query, update, { upsert: false });
	if (!res.modifiedCount) throw new Error(`Updating object '${params.objectId}' failed with MongoDB error`);
}

Master.api.engine.template.object.clone = async function(params, ctx) {
	let newObject = { ...ctx.object }
	let time = this.time();
	objset(newObject, time, 'fields', 'creationTime');
	delete newObject._id;
	let res = await ctx.project.contentDb.objects.insertOne(newObject);
	if (!res.insertedId) throw new Error(`Cloning object '${params.objectId}' failed with MongoDB error`);
	return res.insertedId;

}

Master.api.engine.template.object.delete = async function(params, ctx) {
	let res = await ctx.project.contentDb.objects.deleteOne({ _id: ObjectId(params.objectId)});
	if (!res.deletedCount) throw new Error(`Deleting object '${params.objectId}' failed with MongoDB error`)
}

module.exports = Master;
