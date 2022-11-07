const Master = { commands: {} }

Master.commands.getObjects = async function(params, ctx) {
	return await this.content.objects.find({ template: params.templateCode }).toArray();
}

Master.commands.setSchema = async function(params, ctx) {
	let template = await this.template(params);
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
	await this.content.templates.updateOne({ code: template.code }, values);
}

Master.commands.getSchema = async function(params, ctx) {
	return await this.template(params);
}

Master.commands.updateObjects = async function(params, ctx) {
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
	await this.content.objects.bulkWrite(bulkWrite);
}

module.exports = Master;
