const { ObjectId } = require('mongodb');
const Master = { api: {} }

Master.object = async function(params) {
	let engine = this.engine(params);
	let object = await engine.content.objects.findOne({ _id: ObjectId(params.objectId)})
	assert(object, `No object with id '${params.objectId}' found!`);
	return object;
}

Master.api['engine.template.object.get'] = async function(params) {
	return this.object(params)
}

Master.api['engine.template.object.update'] = async function(params) {
	// assert(false);
	let engine = this.engine(params);
	let object = await this.object(params);

	let query = { _id: ObjectId(params.objectId) };
	let update = {};
	for (let [ field, value ] of Object.entries(params.fields)) {
		if (value !== null) {
			objset(update, value, '$set', `fields.${field}`);
		} else {
			objset(update, null, '$unset', `fields.${field}`);
		}
	}
	let res = await engine.content.objects.updateOne(query, update, { upsert: false });
	if (!res.modifiedCount) throw new Error(`Updating object '${params.objectId}' failed with MongoDB error`);
}

Master.api['engine.template.object.clone'] = async function(params) {
	let engine = this.engine(params);
	let object = await this.object(params);
	let newObject = { ...object }
	objset(newObject, now(), 'fields', 'creationTime');
	delete newObject._id;
	let res = await engine.content.objects.insertOne(newObject);
	if (!res.insertedId) throw new Error(`Cloning object '${params.objectId}' failed with MongoDB error`);
	return res.insertedId;

}

Master.api['engine.template.object.delete'] = async function(params) {
	let engine = this.engine(params);
	let object = await this.object(params);
	let res = await engine.content.objects.deleteOne({ _id: ObjectId(object._id)});
	if (!res.deletedCount) throw new Error(`Deleting object '${params.objectId}' failed with MongoDB error`)
}

Master.api['engine.template.createObject'] = async function(params) {
	let engine = this.engine(params);
	let newObject = {
		template: params.templateCode,
		fields: {
			creationTime: now(),
		}
	}
	let res = await engine.content.objects.insertOne(newObject);
	if (!res.insertedId) throw new Error(`Creating new object for template '${params.templateCode}' failed with MongoDB error`);
	return res.insertedId;
}

module.exports = Master;
