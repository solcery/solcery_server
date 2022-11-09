const Master = { api: { engine: { template: {} } } }

Master.api.engine.template.ctx = async function(params, ctx) {
	ctx.template = await ctx.project.contentDb.templates.findOne({ code: params.templateCode });
	assert(ctx.template, `No template with id '${params.templateCode}' found!`);
}

Master.api.engine.template.getObjects = async function(params, ctx) {
	return await ctx.project.contentDb.objects.find({ template: params.templateCode }).toArray();
}

Master.api.engine.template.setSchema = async function(params, ctx) {
	let template = await ctx.template;
	let schema = params.schema;
	var values = {
	    $set: {
			revision: template.revision + 1,
			name: schema.name,
			buildTargets: schema.buildTargets,
			fields: schema.fields,
			menuOrder: schema.menuOrder,
			singleton: schema.singleton,
		},
	};
	await ctx.project.contentDb.templates.updateOne({ code: template.code }, values);
}

Master.api.engine.template.getSchema = async function(params, ctx) {
	return ctx.template;
}

Master.api.engine.template.updateObjects = async function(params, ctx) {
	let bulkWrite = [];
	for (let object of params.objects) {
		let filter = { _id: require('mongodb').ObjectId(object._id) };
		let update = {};
		for (let [ field, value ] of Object.entries(object.fields)) {
			if (value !== null) {
				objset(update, value, '$set', `fields.${field}`);
			} else {
				objset(update, null, '$unset', `fields.${field}`);
			}
		}
		bulkWrite.push({
			updateOne: { 
				filter, 
				update,
			}
		})
	}
	await ctx.project.contentDb.objects.bulkWrite(bulkWrite);
}

Master.api.engine.template.createObject = async function(params, ctx) {
	let newObject = {
		template: params.templateCode,
		fields: {
			creationTime: this.time(),
		}
	}
	let res = await ctx.project.contentDb.objects.insertOne(newObject);
	if (!res.insertedId) throw new Error(`Creating new object for template '${params.templateCode}' failed with MongoDB error`);
	return res.insertedId;
}


module.exports = Master;
