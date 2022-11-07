const { ObjectId } = require('mongodb');
const Master = { entrypoints: {} }

Master.entrypoints.object = async function(params, ctx) {
	ctx.object = await this.content.objects.findOne({ 
		_id: ObjectId(params.objectId),
		template: ctx.template.code,
	})
	assert(ctx.object, `No object with id '${params.objectId}' found!`);
}

module.exports = Master;
