const { ObjectId } = require('mongodb');
const Master = { commands: {} }

Master.commands.checkAccess = async function(params) {
	return true;
}

Master.commands.get = async function(params) {
	return await ctx.user;
}

Master.commands.update = async function(params) {
	let update = {};
	for (let [ field, value ] of Object.entries(params.fields)) {
		if (value !== null) {
			objset(update, value, '$set', `fields.${field}`);
		} else {
			objset(update, null, '$unset', `fields.${field}`);
		}
	}
	await this.system.users.updateOne({ pubkey: params.pubkey }, update);
}

module.exports = Master;
