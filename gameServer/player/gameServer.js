const Master = {};

Master.onPlayerWSConnected = async function(pubkey, wsConnection) {
	let player = this.get(Player, pubkey);
	if (!player) {
		player = await this.create(Player, {
			id: pubkey,
			pubkey: pubkey,
			status: { // TODO: remove
				code: 'online',
			}
		});
	}
	await player.execAllMixins('onWSConnected', wsConnection);
}

module.exports = Master
