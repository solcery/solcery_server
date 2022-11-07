const Master = { commands: {}, entrypoints: {} }

Master.entrypoints.user = async function(params, ctx) {
	ctx.user = await this.system.users.findOne({ pubkey: params.pubkey });
	assert(ctx.user, `No user with id '${params.pubkey}' found!`);
}

module.exports = Master;
