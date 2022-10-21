const { ObjectId } = require('mongodb');
const Master = { api: {} }

Master.object = async function(params) {
	let { mongo } = this.engine(params);
	let object = await mongo.objects.findOne({ _id: ObjectId(params.objectId)})
	assert(object, `No object with id '${params.objectId}' found!`);
	return object;
}

Master.api['engine.object.get'] = async function(params) {
	return this.object(params)
}

Master.api['engine.object.update'] = async function(params) {
	// assert(false);
	let { mongo } = this.engine(params);
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
	let res = await mongo.objects.updateOne(query, update, { upsert: false });
	if (!res.modifiedCount) throw new Error(`Updating object '${params.objectId}' failed with MongoDB error`);
}

Master.api['engine.object.clone'] = async function(params) {
	let { mongo } = this.engine(params);
	let object = await this.object(params);
	let newObject = { ...object }
	delete newObject._id;
	let res = await mongo.objects.insertOne(newObject);
	if (!res.insertedId) throw new Error(`Cloning object '${params.objectId}' failed with MongoDB error`);
	return res.insertedId;

}

Master.api['engine.object.delete'] = async function(params) {
	let { mongo } = this.engine(params);
	let object = await this.object(params);
	let res = await mongo.objects.deleteOne({ _id: ObjectId(object._id)});
	if (!res.deletedCount) throw new Error(`Deleting object '${params.objectId}' failed with MongoDB error`)
}

module.exports = Master;
