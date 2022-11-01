const Master = { api: {} }

Master.template = async function(params) {
	let engine = this.engine(params);
	let template = await engine.content.templates.findOne({ code: params.templateCode })
	assert(template, `No template with id '${params.templateCode}' found!`);
	return template;
}

Master.api['engine.template.getObjects'] = async function(params) {
	let engine = this.engine(params);
	return await engine.content.objects.find({ template: params.templateCode }).toArray();
}

Master.api['engine.template.setSchema'] = async function(params) {
	let engine = this.engine(params);
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
	await engine.content.templates.updateOne({ code: template.code }, values);
}

Master.api['engine.template.getSchema'] = async function(params) {
	return await this.template(params);
}

Master.api['engine.template.updateObjects'] = async function(params) {
	let engine = this.engine(params);
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
	await engine.content.objects.bulkWrite(bulkWrite);
}

module.exports = Master;
