const { ObjectId } = require('mongodb');
const Master = {}

Master.engine.object = async function(params, ctx) {
	ctx.object = await ctx.mongo.objects.find({ _id: ObjectId(params.objectId)})
}

Master.engine.object.get = async function(params, ctx) {

}

Master.engine.object.update = async function(params, ctx) {

}

Master.engine.object.clone = async function(params, ctx) {

}

Master.engine.object.delete = async function(params, ctx) {

}

module.exports = Master;
