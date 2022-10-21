const { ObjectId } = require('mongodb');
const Master = { api: {} }

Master.object = async function(params, ctx) {
	ctx.object = await ctx.mongo.objects.find({ _id: ObjectId(params.objectId)})
}

Master.api['engine.object.get'] = async function(params, ctx) {

}

Master.api['engine.object.update'] = async function(params, ctx) {

}

Master.api['engine.object.clone'] = async function(params, ctx) {

}

Master.api['engine.object.delete'] = async function(params, ctx) {

}

module.exports = Master;
