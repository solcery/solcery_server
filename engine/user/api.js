const { ObjectId } = require('mongodb');
const Master = { api: {} }

Master.user = async function(params) {
	let engine = this.engine(params);
	let user = await engine.system.users.findOne({ pubkey: params.pubkey });
	assert(user, `No user with id '${params.pubkey}' found!`);
	return user;
}

Master.api['engine.user.checkAccess'] = async function(params) {
	return true;
}

Master.api['engine.user.get'] = async function(params) {
	return await this.user(params);
}

Master.api['engine.user.update'] = async function(params) {
	let engine = this.engine(params);
	let update = {};
	for (let [ field, value ] of Object.entries(params.fields)) {
		if (value !== null) {
			objset(update, value, '$set', `fields.${field}`);
		} else {
			objset(update, null, '$unset', `fields.${field}`);
		}
	}
	await engine.system.users.updateOne({ pubkey: params.pubkey }, update);
}

module.exports = Master;
