const { ObjectId } = require('mongodb');
const Master = { api: { engine: { user: {} } } }

Master.api.engine.user.ctx = async function(params, ctx) {
	ctx.user = await ctx.engine.system.users.findOne({ pubkey: params.pubkey });
	assert(ctx.user, `No user with id '${params.pubkey}' found!`);
}

Master.api.engine.user.checkAccess = async function(params, ctx) {
	return true;
}

Master.api.engine.user.get = async function(params, ctx) {
	return await ctx.user;
}

Master.api.engine.user.update = async function(params, ctx) {
	let update = {};
	for (let [ field, value ] of Object.entries(params.fields)) {
		if (value !== null) {
			objset(update, value, '$set', `fields.${field}`);
		} else {
			objset(update, null, '$unset', `fields.${field}`);
		}
	}
	await ctx.engine.system.users.updateOne({ pubkey: params.pubkey }, update);
}

module.exports = Master;
